import type { AssetConnectorType, AssetResult } from "../connectors/types";
import { errorMessage } from "../errors";
import { createEmitter } from "../store/emitter";
import {
	resolveConcurrencyLimits,
	type ConcurrencyLimits,
} from "./concurrency";
import { ElapsedTicker } from "./elapsedTicker";
import { generateForElement } from "./generateForElement";
import { rebuildNode } from "./generationGraph";
import { SnapshotStore, type ElementSnapshot } from "./snapshots";
import { generationInputs, needsGeneration } from "./staleness";
import type { CommittedVersion } from "./versions";
import { flattenGraph, type BuildContext, type GenerationNode } from "./graph";

type ActiveJob = {
	controller: AbortController;
	connectorType: AssetConnectorType;
};

type QueuedJob = {
	node: GenerationNode;
	context: () => BuildContext;
};

/**
 * Runs generation nodes, at most `limits[connectorType]` of each media type at a
 * time and never before their dependencies have settled. All per-element state
 * lives in the snapshot store; the queue owns only what is in flight.
 */
export class GenerationQueue {
	private readonly snapshots: SnapshotStore;
	private readonly ticker = new ElapsedTicker((elapsed) =>
		this.onTick(elapsed),
	);
	private pending: QueuedJob[] = [];
	private active = new Map<string, ActiveJob>();
	private readonly limits: ConcurrencyLimits;
	private readonly committed = createEmitter<CommittedVersion>();

	constructor({
		limits,
		initialState,
	}: {
		limits?: Partial<ConcurrencyLimits>;
		initialState?: Record<string, ElementSnapshot>;
	} = {}) {
		this.limits = resolveConcurrencyLimits(limits);
		this.snapshots = new SnapshotStore(initialState);
	}

	onCommitted = this.committed.subscribe;

	subscribe = (listener: () => void) => this.snapshots.subscribe(listener);
	getElementSnapshot = (id: string): ElementSnapshot => this.snapshots.get(id);
	getResultVersion = () => this.snapshots.getResultVersion();
	getActiveCount = () => this.snapshots.getActiveCount();
	getGeneratedCount = () => this.snapshots.getGeneratedCount();
	isBusy = () => this.snapshots.isBusy();
	snapshot = () => this.snapshots.all();

	private onTick(elapsed: [string, number][]) {
		let changed = false;
		for (const [id, seconds] of elapsed) {
			const snap = this.snapshots.get(id);
			if (snap.status !== "generating" || snap.seconds === seconds) continue;
			this.snapshots.update(id, { seconds });
			changed = true;
		}
		if (changed) this.snapshots.notify();
	}

	/**
	 * Roots are always queued: asking to generate something means regenerating
	 * it. Each job is built again from `context` when it runs.
	 */
	enqueueGraph(roots: GenerationNode[], context: () => BuildContext) {
		const rootIds = new Set(roots.map((root) => root.id));
		let added = false;
		for (const node of flattenGraph(roots)) {
			if (this.snapshots.isActive(node.id)) continue;
			if (!rootIds.has(node.id) && !needsGeneration(node, this)) continue;
			this.snapshots.update(node.id, {
				status: "queued",
				seconds: 0,
				connectorType: node.job.connectorType,
			});
			this.pending.push({ node, context });
			added = true;
		}
		if (added) {
			this.snapshots.notify();
			this.processQueue();
		}
	}

	cancel(elementId: string) {
		if (!this.snapshots.isActive(elementId)) return;
		this.abortJob(elementId);
		this.snapshots.resetToIdle(elementId);
		this.snapshots.notify();
		this.processQueue();
	}

	replaceSnapshots(state: Record<string, ElementSnapshot>) {
		this.cancelAll();
		this.snapshots.replaceAll(state);
	}

	cancelAll() {
		for (const [id, { controller }] of this.active) {
			controller.abort();
			this.ticker.stop(id);
		}
		this.active.clear();
		this.pending = [];
		for (const id of this.snapshots.ids()) {
			this.snapshots.resetToIdle(id);
		}
		this.snapshots.notify();
	}

	discard(elementId: string) {
		const wasActive = this.snapshots.isActive(elementId);
		if (wasActive) this.abortJob(elementId);
		this.snapshots.remove(elementId);
		this.snapshots.notify();
		if (wasActive) this.processQueue();
	}

	setError(elementId: string, message: string) {
		this.snapshots.update(elementId, { result: null, error: message });
		this.snapshots.notify();
	}

	/**
	 * Aborts any in-flight job first, which would otherwise land later and clobber
	 * this. Pass `pinned` for a result the user supplied rather than asked us to
	 * make, so drifting project state cannot let Generate All overwrite it.
	 */
	commitResult(
		node: GenerationNode,
		result: AssetResult,
		{ pinned = false }: { pinned?: boolean } = {},
	): void {
		this.cancel(node.id);
		this.commit({
			elementId: node.id,
			elementType: node.job.elementType,
			connectorType: node.job.connectorType,
			inputs: generationInputs(node, this),
			result,
			pinned,
		});
	}

	restoreResult({
		elementId,
		inputs,
		result,
		connectorType,
		pinned,
	}: CommittedVersion): void {
		this.snapshots.update(elementId, {
			result,
			error: null,
			resultInputs: inputs,
			connectorType,
			pinned,
		});
		this.snapshots.notify();
	}

	private commit(version: CommittedVersion): void {
		this.snapshots.commit(version);
		this.snapshots.notify();
		this.committed.notify(version);
	}

	private abortJob(id: string) {
		this.active.get(id)?.controller.abort();
		this.active.delete(id);
		this.ticker.stop(id);
		this.pending = this.pending.filter(({ node }) => node.id !== id);
	}

	/** The dependency holding `node` back, if any: it gates until it settles. */
	private blockingDependency(node: GenerationNode) {
		return Object.values(node.dependsOn).find(
			(dep) =>
				this.snapshots.isActive(dep.id) || !this.snapshots.get(dep.id).result,
		);
	}

	private hasCapacity(connectorType: AssetConnectorType) {
		const running = [...this.active.values()].filter(
			(job) => job.connectorType === connectorType,
		).length;
		return running < this.limits[connectorType];
	}

	private processQueue() {
		for (;;) {
			const index = this.pending.findIndex(
				({ node }) =>
					this.hasCapacity(node.job.connectorType) &&
					!this.blockingDependency(node),
			);
			if (index === -1) break;
			const [queued] = this.pending.splice(index, 1);
			if (queued) void this.runJob(queued);
		}
		this.releaseBlocked();
	}

	/** The failure that kept `node` waiting, following the chain of blocked dependencies. */
	private blockedByError(node: GenerationNode): string | null {
		const dep = this.blockingDependency(node);
		if (!dep) return null;
		return this.snapshots.get(dep.id).error ?? this.blockedByError(dep);
	}

	/** Nothing running or runnable means a dependency never arrived: release the rest, its error on each dependent. */
	private releaseBlocked() {
		if (this.active.size > 0 || this.pending.length === 0) return;
		const blocked = this.pending;
		this.pending = [];
		for (const { node } of blocked) {
			const error = this.blockedByError(node);
			this.snapshots.resetToIdle(node.id);
			if (error) this.snapshots.update(node.id, { error });
		}
		this.snapshots.notify();
	}

	private dependencyResults(node: GenerationNode): Record<string, AssetResult> {
		const entries = Object.entries(node.dependsOn).flatMap(([label, dep]) => {
			const { result } = this.snapshots.get(dep.id);
			return result ? [[label, result] as const] : [];
		});
		return Object.fromEntries(entries);
	}

	/** A cancelled job settles into nothing: whoever aborted it already cleaned up. */
	private async runJob({ node, context }: QueuedJob) {
		const {
			id: elementId,
			job: { elementType, connectorType },
		} = node;
		const controller = new AbortController();
		const { signal } = controller;
		this.active.set(elementId, { controller, connectorType });

		this.snapshots.update(elementId, { status: "generating", seconds: 0 });
		this.snapshots.notify();
		this.ticker.start(elementId);

		try {
			const current = rebuildNode(node, context());
			const inputs = generationInputs(current, this);
			const result = await generateForElement(
				current,
				this.dependencyResults(current),
				signal,
			);
			if (signal.aborted) return;
			this.commit({
				elementId,
				elementType,
				connectorType,
				inputs,
				result,
				pinned: false,
			});
		} catch (error) {
			if (signal.aborted) return;
			console.error(`Generation failed for element ${elementId}:`, error);
			this.snapshots.update(elementId, {
				status: "idle",
				seconds: 0,
				result: null,
				error: errorMessage(error),
			});
			this.snapshots.notify();
		} finally {
			if (!signal.aborted) this.finalizeJob(elementId);
		}
	}

	private finalizeJob(elementId: string) {
		this.ticker.stop(elementId);
		this.active.delete(elementId);
		this.processQueue();
	}
}
