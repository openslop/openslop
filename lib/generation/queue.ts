import type { ElementRef } from "@/lib/canvas/types";
import type { AssetConnectorType, AssetResult } from "../connectors/types";
import { errorMessage } from "../errors";
import { createEmitter } from "../store/emitter";
import {
	resolveConcurrencyLimits,
	type ConcurrencyLimits,
} from "./concurrency";
import { generateForElement } from "./generate-for-element";
import {
	isGenerationActive,
	SnapshotStore,
	type ElementSnapshot,
} from "./snapshots";
import { generationInputs, needsGeneration } from "./staleness";
import type { CommittedVersion } from "./versions";
import {
	flattenGraph,
	type GenerationNode,
	type Landing,
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
	private pending: GenerationNode[] = [];
	private active = new Map<string, ActiveJob>();
	private readonly limits: ConcurrencyLimits;
	private readonly committed = createEmitter<CommittedVersion>();
	private readonly newResult = createEmitter<string>();

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
	/** Generated, uploaded or restored; revising the held result is not new. */
	onNewResult = this.newResult.subscribe;

	subscribe = (listener: () => void) => this.snapshots.subscribe(listener);
	getElementSnapshot = (id: string): ElementSnapshot => this.snapshots.get(id);
	getResultVersion = () => this.snapshots.getResultVersion();
	getActiveCount = () => this.snapshots.getActiveCount();
	getGeneratedCount = () => this.snapshots.getGeneratedCount();
	isBusy = () => this.snapshots.isBusy();
	snapshot = () => this.snapshots.all();

	/** Roots are always queued: asking to generate something means regenerating it. */
	enqueueGraph(roots: GenerationNode[]) {
		const rootIds = new Set(roots.map((root) => root.id));
		let added = false;
		for (const node of flattenGraph(roots)) {
			if (this.snapshots.isActive(node.id)) continue;
			if (!rootIds.has(node.id) && !needsGeneration(node, this)) continue;
			this.snapshots.update(node.id, {
				status: "queued",
				startedAt: null,
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

	replaceSnapshots(state: Record<string, ElementSnapshot>) {
		this.cancelAll();
		this.snapshots.replaceAll(state);
	}

	cancelAll() {
		for (const { controller } of this.active.values()) controller.abort();
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

	duplicate(fromId: string, toId: string) {
		this.snapshots.copy(fromId, toId);
		this.snapshots.notify();
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

	/** An edit keeps the inputs of the result it edits, so it goes stale with it. */
	reviseResult(
		{ id: elementId, type: elementType }: ElementRef,
		revise: (result: AssetResult) => AssetResult,
	): void {
		const { result, resultInputs, connectorType, pinned, status } =
			this.snapshots.get(elementId);
		if (!result || !resultInputs || !connectorType)
			throw new Error("There is nothing here to edit yet");
		if (isGenerationActive(status)) throw new Error("This is still generating");
		this.record({
			elementId,
			elementType,
			connectorType,
			inputs: resultInputs,
			result: revise(result),
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
		this.newResult.notify(elementId);
	}

	private record(version: CommittedVersion): void {
		this.snapshots.commit(version);
		this.snapshots.notify();
		this.committed.notify(version);
	}

	private commit(version: CommittedVersion): void {
		this.record(version);
		this.newResult.notify(version.elementId);
	}

	private land(id: NodeId, { on, revise }: Landing, result: AssetResult) {
		this.snapshots.remove(id);
		this.reviseResult(on, (current) => revise(current, result));
	}

	private abortJob(id: string) {
		this.active.get(id)?.controller.abort();
		this.active.delete(id);
		this.pending = this.pending.filter((node) => node.id !== id);
	}

	/** The dependency holding `node` back, if any, with the label it was declared under. */
	private blockingDependency(node: GenerationNode) {
		return Object.entries(node.dependsOn).find(
			([, dep]) =>
				this.snapshots.isActive(dep.id) || !this.snapshots.get(dep.id).result,
		);
	}

	private hasCapacity(connectorType: AssetConnectorType) {
		const running = [...this.active.values()].filter(
			(job) => job.connectorType === connectorType,
		).length;
		return running < this.limits[connectorType];
	}

	private nextReady() {
		for (const node of this.pending) {
			const blocker = this.blockingDependency(node);
			const runnable = !blocker && this.hasCapacity(node.job.connectorType);
			const releasable = blocker && !this.snapshots.isActive(blocker[1].id);
			if (runnable || releasable) return { node, blocker };
		}
	}

	private processQueue() {
		for (let next = this.nextReady(); next; next = this.nextReady()) {
			const { node, blocker } = next;
			this.pending = this.pending.filter((candidate) => candidate !== node);
			if (blocker) this.release(node, blocker);
			else void this.runJob(node);
		}
	}

	private release(
		node: GenerationNode,
		[label, dep]: [string, GenerationNode],
	) {
		const cause = this.snapshots.get(dep.id).error;
		this.snapshots.resetToIdle(node.id);
		if (cause)
			this.snapshots.update(node.id, { error: `${label} failed: ${cause}` });
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
	private async runJob(node: GenerationNode) {
		const {
			id: elementId,
			job: { elementType, connectorType },
		} = node;
		const controller = new AbortController();
		const { signal } = controller;
		this.active.set(elementId, { controller, connectorType });

		this.snapshots.update(elementId, {
			status: "generating",
			startedAt: Date.now(),
		});
		this.snapshots.notify();

		try {
			const inputs = generationInputs(node, this);
			const result = await generateForElement(
				node,
				this.dependencyResults(node),
				signal,
			);
			if (signal.aborted) return;
			if (node.lands) return this.land(elementId, node.lands, result);
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
				startedAt: null,
				result: null,
				error: errorMessage(error),
			});
			this.snapshots.notify();
		} finally {
			if (!signal.aborted) this.finalizeJob(elementId);
		}
	}

	private finalizeJob(elementId: string) {
		this.active.delete(elementId);
		this.processQueue();
	}
}
