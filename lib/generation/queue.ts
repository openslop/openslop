import type {
	AssetConnectorType,
	AssetResult,
	ConnectorConfig,
	ProviderKey,
} from "../connectors/types";
import { errorMessage } from "../errors";
import { generateForElement } from "./generateForElement";
import { serializeInputs, type GenerationInputs } from "./inputs";
import type { ProjectData } from "@/lib/project/store";
import {
	flattenGraph,
	isSourceNode,
	needsGeneration,
	nodeInputs,
	requireJob,
	type GenerationNode,
	type NodeId,
} from "./graph";

export type GenerationStatus = "idle" | "queued" | "generating";

export type ElementSnapshot = {
	status: GenerationStatus;
	seconds: number;
	result: AssetResult | null;
	error: string | null;
	resultInputs: GenerationInputs | null;
	connectorType: AssetConnectorType | null;
	/** The result was supplied rather than generated, so it is never regenerated. */
	pinned: boolean;
};

export type GenerationJob = {
	elementId: string;
	connectorType: AssetConnectorType;
	provider: ProviderKey;
	config: ConnectorConfig;
	/** The project state this job's inputs were resolved against. */
	state: ProjectData;
};

const EMPTY_SNAPSHOT: ElementSnapshot = {
	status: "idle",
	seconds: 0,
	result: null,
	error: null,
	resultInputs: null,
	connectorType: null,
	pinned: false,
};

/** A generation is active from the moment it is queued until it settles. */
export const isGenerationActive = (status: GenerationStatus) =>
	status === "queued" || status === "generating";

export class GenerationQueue {
	private state = new Map<string, ElementSnapshot>();
	private pending: GenerationNode[] = [];
	private controllers = new Map<string, AbortController>();
	private jobStarts = new Map<string, number>();
	private tickTimer: ReturnType<typeof setInterval> | null = null;
	private listeners = new Set<() => void>();
	private history = new Map<string, Map<string, AssetResult>>();
	private readonly batchSize: number;
	private _resultVersion = 0;

	constructor({
		batchSize,
		initialState = {},
	}: {
		batchSize: number;
		initialState?: Record<string, ElementSnapshot>;
	}) {
		this.batchSize = batchSize;
		for (const [id, snap] of Object.entries(initialState)) {
			this.state.set(id, { ...snap, status: "idle", seconds: 0 });
		}
	}

	private ensureTickTimer() {
		if (this.tickTimer || this.jobStarts.size === 0) return;
		this.tickTimer = setInterval(() => {
			let changed = false;
			const now = Date.now();
			for (const [id, start] of this.jobStarts) {
				if (this.state.get(id)?.status !== "generating") continue;
				const seconds = ((now - start) / 1000) | 0;
				if (this.getElementSnapshot(id).seconds !== seconds) {
					this.update(id, { seconds });
					changed = true;
				}
			}
			if (changed) this.notify();
		}, 1000);
	}

	private maybeStopTickTimer() {
		if (this.tickTimer && this.jobStarts.size === 0) {
			clearInterval(this.tickTimer);
			this.tickTimer = null;
		}
	}

	subscribe = (listener: () => void) => {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	};

	getElementSnapshot = (id?: string): ElementSnapshot => {
		return (id && this.state.get(id)) || EMPTY_SNAPSHOT;
	};

	getResultVersion = () => this._resultVersion;

	isBusy = (): boolean => {
		for (const snap of this.state.values()) {
			if (isGenerationActive(snap.status)) return true;
		}
		return false;
	};

	private count(predicate: (snap: ElementSnapshot) => boolean): number {
		let n = 0;
		for (const snap of this.state.values()) {
			if (predicate(snap)) n++;
		}
		return n;
	}

	getActiveCount = (): number =>
		this.count((s) => isGenerationActive(s.status));

	getGeneratedCount = (): number =>
		this.count((s) => !isGenerationActive(s.status) && s.result != null);

	snapshot(): Record<string, ElementSnapshot> {
		return Object.fromEntries(this.state);
	}

	private isInQueue(id: string): boolean {
		const s = this.state.get(id)?.status;
		return s !== undefined && isGenerationActive(s);
	}

	private update(id: string, patch: Partial<ElementSnapshot>) {
		if (
			"result" in patch &&
			patch.result !== this.getElementSnapshot(id).result
		)
			this._resultVersion++;
		this.state.set(id, { ...this.getElementSnapshot(id), ...patch });
	}

	private abortJob(id: string) {
		this.controllers.get(id)?.abort();
		this.controllers.delete(id);
		this.stopTimer(id);
		this.pending = this.pending.filter((node) => node.id !== id);
	}

	private resetToIdle(id: string) {
		const { result, error, resultInputs, connectorType, pinned } =
			this.getElementSnapshot(id);
		if (result || error) {
			this.state.set(id, {
				status: "idle",
				seconds: 0,
				result,
				error,
				resultInputs,
				connectorType,
				pinned,
			});
		} else {
			this.state.delete(id);
		}
	}

	/** Roots are always queued: asking to generate something means regenerating it. */
	enqueueGraph(roots: GenerationNode[]) {
		const rootIds = new Set(roots.map((root) => root.id));
		let added = false;
		for (const node of flattenGraph(roots)) {
			if (isSourceNode(node) || this.isInQueue(node.id)) continue;
			if (!rootIds.has(node.id) && !needsGeneration(node, this)) continue;
			this.update(node.id, {
				status: "queued",
				seconds: 0,
				connectorType: requireJob(node).connectorType,
			});
			this.pending.push(node);
			added = true;
		}
		if (added) {
			this.notify();
			this.processQueue();
		}
	}

	cancel(elementId: string) {
		if (!this.isInQueue(elementId)) return;
		this.abortJob(elementId);
		this.resetToIdle(elementId);
		this.notify();
		this.processQueue();
	}

	cancelAll() {
		for (const [id, controller] of this.controllers) {
			controller.abort();
			this.stopTimer(id);
		}
		this.controllers.clear();
		this.pending = [];
		for (const id of this.state.keys()) {
			this.resetToIdle(id);
		}
		this.notify();
	}

	discard(elementId: string) {
		const hadEntry = this.isInQueue(elementId);
		if (hadEntry) this.abortJob(elementId);
		if (this.state.get(elementId)?.result) this._resultVersion++;
		this.state.delete(elementId);
		this.notify();
		if (hadEntry) this.processQueue();
	}

	setError(elementId: string, message: string) {
		this.update(elementId, { result: null, error: message });
		this.notify();
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
		this.commit(
			node.id,
			result,
			nodeInputs(node, this),
			requireJob(node).connectorType,
			pinned,
		);
	}

	private commit(
		elementId: string,
		result: AssetResult,
		inputs: GenerationInputs,
		connectorType: AssetConnectorType,
		pinned = false,
	): void {
		const key = serializeInputs(inputs);
		const elHistory =
			this.history.get(elementId) ?? new Map<string, AssetResult>();
		elHistory.set(key, result);
		this.history.set(elementId, elHistory);
		this.update(elementId, {
			status: "idle",
			seconds: 0,
			result,
			error: null,
			resultInputs: inputs,
			connectorType,
			pinned,
		});
		this.notify();
	}

	restoreResult(elementId: string, inputs: GenerationInputs): boolean {
		const key = serializeInputs(inputs);
		const cached = this.history.get(elementId)?.get(key);
		if (!cached) return false;
		this.update(elementId, {
			result: cached,
			error: null,
			resultInputs: inputs,
		});
		this.notify();
		return true;
	}

	private notify() {
		for (const listener of this.listeners) {
			listener();
		}
	}

	private stopTimer(elementId: string) {
		this.jobStarts.delete(elementId);
		this.maybeStopTickTimer();
	}

	/** The dependency holding `node` back, if any: it gates until it settles. */
	private blockingDependency(node: GenerationNode) {
		return node.dependsOn.find(
			(dep) =>
				!isSourceNode(dep) &&
				(this.isInQueue(dep.id) || !this.getElementSnapshot(dep.id).result),
		);
	}

	private processQueue() {
		while (this.controllers.size < this.batchSize) {
			const index = this.pending.findIndex(
				(node) => !this.blockingDependency(node),
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
		return this.getElementSnapshot(dep.id).error ?? this.blockedByError(dep);
	}

	/**
	 * Nothing running and nothing runnable means a dependency never arrived, so
	 * release what is left rather than leaving it queued forever. A dependency
	 * that failed is reported on the dependent too: a derived node has no card of
	 * its own, so its error would otherwise never reach anyone.
	 */
	private releaseBlocked() {
		if (this.controllers.size > 0 || this.pending.length === 0) return;
		const blocked = this.pending;
		this.pending = [];
		for (const node of blocked) {
			const error = this.blockedByError(node);
			this.resetToIdle(node.id);
			if (error) this.update(node.id, { error });
		}
		this.notify();
	}

	private dependencyResults(node: GenerationNode): Record<NodeId, AssetResult> {
		const entries = node.dependsOn.flatMap((dep) => {
			const { result } = this.getElementSnapshot(dep.id);
			return result ? [[dep.id, result] as const] : [];
		});
		return Object.fromEntries(entries);
	}

	private runJob(node: GenerationNode) {
		const job = requireJob(node);
		const { elementId } = job;
		const controller = new AbortController();
		this.controllers.set(elementId, controller);

		this.update(elementId, { status: "generating", seconds: 0 });
		this.notify();
		this.startElapsedTimer(elementId);

		const inputs = nodeInputs(node, this);
		generateForElement(job, inputs, this.dependencyResults(node))
			.then((result) => this.handleJobSuccess(job, inputs, result, controller))
			.catch((err) => this.handleJobError(elementId, err, controller))
			.finally(() => this.finalizeJob(elementId, controller));
	}

	private startElapsedTimer(elementId: string) {
		this.jobStarts.set(elementId, Date.now());
		this.ensureTickTimer();
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
		this.update(elementId, {
			status: "idle",
			seconds: 0,
			result: null,
			error: errorMessage(err),
		});
		this.notify();
	}

	// Both terminal handlers notify (commitResult on success, handleJobError on
	// failure), so this only does queue bookkeeping.
	private finalizeJob(elementId: string, controller: AbortController) {
		if (controller.signal.aborted) return;
		this.stopTimer(elementId);
		this.controllers.delete(elementId);
		this.processQueue();
	}
}

export const DEFAULT_BATCH_SIZE = 2;
