import isEqual from "lodash/isEqual";
import isNil from "lodash/isNil";
import type { CanvasContentElement } from "../canvas/types";
import type {
	AssetConnectorType,
	AssetResult,
	ConnectorConfig,
	ProviderKey,
} from "../connectors/types";
import { errorMessage } from "../errors";
import { getProjectStore } from "../project/store";
import { generateForElement } from "./generateForElement";
import { getGenerationInputs } from "./getGenerationInputs";
import { serializeInputs, type GenerationInputs } from "./generationInputs";

export type GenerationStatus = "idle" | "queued" | "generating";

export type ElementSnapshot = {
	status: GenerationStatus;
	seconds: number;
	result: AssetResult | null;
	error: string | null;
	resultInputs: GenerationInputs | null;
	connectorType: AssetConnectorType | null;
};

export function isStaleResult(
	snapshot: ElementSnapshot,
	currentInputs: GenerationInputs,
): boolean {
	if (isNil(snapshot.result)) return false;
	return !isEqual(currentInputs, snapshot.resultInputs);
}

export type GenerationJob = {
	elementId: string;
	connectorType: AssetConnectorType;
	provider: ProviderKey;
	config: ConnectorConfig;
	projectId: string;
	element: CanvasContentElement;
};

const EMPTY_SNAPSHOT: ElementSnapshot = {
	status: "idle",
	seconds: 0,
	result: null,
	error: null,
	resultInputs: null,
	connectorType: null,
};

const isActive = (status: ElementSnapshot["status"]) =>
	status === "queued" || status === "generating";

export class GenerationQueue {
	private state = new Map<string, ElementSnapshot>();
	private pending: GenerationJob[] = [];
	private controllers = new Map<string, AbortController>();
	private jobStarts = new Map<string, number>();
	private tickTimer: ReturnType<typeof setInterval> | null = null;
	private listeners = new Set<() => void>();
	private history = new Map<string, Map<string, AssetResult>>();
	private readonly batchSize: number;
	private _resultVersion = 0;
	private _peakActive = 0;

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
			if (isActive(snap.status)) return true;
		}
		return false;
	};

	getActiveCount = (): number => {
		let active = 0;
		for (const snap of this.state.values()) {
			if (isActive(snap.status)) active++;
		}
		return active;
	};

	getPeakActive = (): number => this._peakActive;

	snapshot(): Record<string, ElementSnapshot> {
		return Object.fromEntries(this.state);
	}

	private isInQueue(id: string): boolean {
		const s = this.state.get(id)?.status;
		return s !== undefined && isActive(s);
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
		this.pending = this.pending.filter((j) => j.elementId !== id);
	}

	private resetToIdle(id: string) {
		const { result, error, resultInputs, connectorType } =
			this.getElementSnapshot(id);
		if (result || error) {
			this.state.set(id, {
				status: "idle",
				seconds: 0,
				result,
				error,
				resultInputs,
				connectorType,
			});
		} else {
			this.state.delete(id);
		}
	}

	enqueue(job: GenerationJob) {
		this.enqueueAll([job]);
	}

	enqueueAll(jobs: GenerationJob[]) {
		let added = false;
		for (const job of jobs) {
			if (this.isInQueue(job.elementId)) continue;
			this.update(job.elementId, {
				status: "queued",
				seconds: 0,
				connectorType: job.connectorType,
			});
			this.pending.push(job);
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

	setManualResult(
		elementId: string,
		result: AssetResult,
		inputs: GenerationInputs,
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
		const active = this.getActiveCount();
		this._peakActive = active === 0 ? 0 : Math.max(this._peakActive, active);
		for (const listener of this.listeners) {
			listener();
		}
	}

	private stopTimer(elementId: string) {
		this.jobStarts.delete(elementId);
		this.maybeStopTickTimer();
	}

	private processQueue() {
		while (this.controllers.size < this.batchSize && this.pending.length > 0) {
			const job = this.pending.shift();
			if (!job) break;
			this.runJob(job);
		}
	}

	private runJob(job: GenerationJob) {
		const { elementId } = job;
		const controller = new AbortController();
		this.controllers.set(elementId, controller);

		this.update(elementId, { status: "generating", seconds: 0 });
		this.notify();
		this.startElapsedTimer(elementId);

		const { metadata } = getProjectStore(job.projectId).getState();
		const inputs = getGenerationInputs(job.element, metadata);
		generateForElement(job, inputs)
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
		const key = serializeInputs(inputs);
		const elHistory =
			this.history.get(job.elementId) ?? new Map<string, AssetResult>();
		elHistory.set(key, result);
		this.history.set(job.elementId, elHistory);
		this.update(job.elementId, {
			status: "idle",
			seconds: 0,
			result,
			error: null,
			resultInputs: inputs,
		});
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
	}

	private finalizeJob(elementId: string, controller: AbortController) {
		if (controller.signal.aborted) return;
		this.stopTimer(elementId);
		this.controllers.delete(elementId);
		this.notify();
		this.processQueue();
	}
}

export const DEFAULT_BATCH_SIZE = 2;
