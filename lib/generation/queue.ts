import type { AssetConnectorType, AssetResult } from "../connectors/types";
import { errorMessage } from "../errors";
import {
	resolveConcurrencyLimits,
	type ConcurrencyLimits,
} from "./concurrency";
import { ElapsedTicker } from "./elapsedTicker";
import { generateForElement } from "./generateForElement";
import type { GenerationInputs } from "./inputs";
import { SnapshotStore, type ElementSnapshot } from "./snapshots";
import type { CommittedVersion } from "./versions";
import {
	flattenGraph,
	isSourceNode,
	needsGeneration,
	nodeInputs,
	type GenerationJob,
	type GenerationNode,
	type JobNode,
	type NodeId,
} from "./graph";

type ActiveJob = {
	controller: AbortController;
	connectorType: AssetConnectorType;
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
	private pending: JobNode[] = [];
	private active = new Map<string, ActiveJob>();
	private readonly limits: ConcurrencyLimits;
	private readonly commitListeners = new Set<
		(version: CommittedVersion) => void
	>();

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

	/** Announces each finished version, so history can file it. */
	onCommitted = (listener: (version: CommittedVersion) => void) => {
		this.commitListeners.add(listener);
		return () => {
			this.commitListeners.delete(listener);
		};
	};

	subscribe = (listener: () => void) => this.snapshots.subscribe(listener);
	getElementSnapshot = (id?: string): ElementSnapshot => this.snapshots.get(id);
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

	/** Roots are always queued: asking to generate something means regenerating it. */
	enqueueGraph(roots: GenerationNode[]) {
		const rootIds = new Set(roots.map((root) => root.id));
		let added = false;
		for (const node of flattenGraph(roots)) {
			if (isSourceNode(node) || this.snapshots.isActive(node.id)) continue;
			if (!rootIds.has(node.id) && !needsGeneration(node, this)) continue;
			this.snapshots.update(node.id, {
				status: "queued",
				seconds: 0,
				connectorType: node.job.connectorType,
			});
			this.pending.push(node);
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
		if (isSourceNode(node))
			throw new Error(`Source node "${node.id}" cannot hold a result`);
		this.cancel(node.id);
		this.commit(
			node.id,
			result,
			nodeInputs(node, this),
			node.job.connectorType,
			pinned,
		);
	}

	/** Shows a version the element made before, provenance and all. */
	restoreResult({ elementId, inputs, result, pinned }: CommittedVersion): void {
		this.snapshots.update(elementId, {
			result,
			error: null,
			resultInputs: inputs,
			pinned,
		});
		this.snapshots.notify();
	}

	private commit(
		elementId: string,
		result: AssetResult,
		inputs: GenerationInputs,
		connectorType: GenerationJob["connectorType"],
		pinned = false,
	): void {
		const version = this.snapshots.commit(
			elementId,
			result,
			inputs,
			connectorType,
			pinned,
		);
		this.snapshots.notify();
		for (const listener of this.commitListeners) listener(version);
	}

	private abortJob(id: string) {
		this.active.get(id)?.controller.abort();
		this.active.delete(id);
		this.ticker.stop(id);
		this.pending = this.pending.filter((node) => node.id !== id);
	}

	/** The dependency holding `node` back, if any: it gates until it settles. */
	private blockingDependency(node: GenerationNode) {
		return node.dependsOn.find(
			(dep) =>
				!isSourceNode(dep) &&
				(this.snapshots.isActive(dep.id) || !this.snapshots.get(dep.id).result),
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
				(node) =>
					this.hasCapacity(node.job.connectorType) &&
					!this.blockingDependency(node),
			);
			if (index === -1) break;
			const [node] = this.pending.splice(index, 1);
			if (node) this.runJob(node);
		}
		this.releaseBlocked();
	}

	/** The failure that kept `node` waiting, following the chain of blocked dependencies. */
	private blockedByError(node: GenerationNode): string | null {
		const dep = this.blockingDependency(node);
		if (!dep) return null;
		return this.snapshots.get(dep.id).error ?? this.blockedByError(dep);
	}

	/**
	 * Nothing running and nothing runnable means a dependency never arrived, so
	 * release what is left rather than leaving it queued forever. A dependency
	 * that failed is reported on the dependent too: a derived node has no card of
	 * its own, so its error would otherwise never reach anyone.
	 */
	private releaseBlocked() {
		if (this.active.size > 0 || this.pending.length === 0) return;
		const blocked = this.pending;
		this.pending = [];
		for (const node of blocked) {
			const error = this.blockedByError(node);
			this.snapshots.resetToIdle(node.id);
			if (error) this.snapshots.update(node.id, { error });
		}
		this.snapshots.notify();
	}

	private dependencyResults(node: GenerationNode): Record<NodeId, AssetResult> {
		const entries = node.dependsOn.flatMap((dep) => {
			const { result } = this.snapshots.get(dep.id);
			return result ? [[dep.id, result] as const] : [];
		});
		return Object.fromEntries(entries);
	}

	private runJob(node: JobNode) {
		const { job } = node;
		const { elementId } = job;
		const controller = new AbortController();
		this.active.set(elementId, {
			controller,
			connectorType: job.connectorType,
		});

		this.snapshots.update(elementId, { status: "generating", seconds: 0 });
		this.snapshots.notify();
		this.ticker.start(elementId);

		const inputs = nodeInputs(node, this);
		generateForElement(job, inputs, this.dependencyResults(node))
			.then((result) => this.handleJobSuccess(job, inputs, result, controller))
			.catch((err) => this.handleJobError(elementId, err, controller))
			.finally(() => this.finalizeJob(elementId, controller));
	}

	private handleJobSuccess(
		job: GenerationJob,
		inputs: GenerationInputs,
		result: AssetResult,
		controller: AbortController,
	) {
		if (controller.signal.aborted) return;
		this.commit(job.elementId, result, inputs, job.connectorType);
	}

	private handleJobError(
		elementId: string,
		err: unknown,
		controller: AbortController,
	) {
		if (controller.signal.aborted) return;
		console.error(`Generation failed for element ${elementId}:`, err);
		this.snapshots.update(elementId, {
			status: "idle",
			seconds: 0,
			result: null,
			error: errorMessage(err),
		});
		this.snapshots.notify();
	}

	// Both terminal handlers notify (commit on success, handleJobError on
	// failure), so this only does queue bookkeeping.
	private finalizeJob(elementId: string, controller: AbortController) {
		if (controller.signal.aborted) return;
		this.ticker.stop(elementId);
		this.active.delete(elementId);
		this.processQueue();
	}
}
