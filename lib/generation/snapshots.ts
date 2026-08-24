import type { AssetConnectorType, AssetResult } from "../connectors/types";
import type { GenerationInputs } from "./inputs";
import type { CommittedTake } from "./versions";

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

/**
 * Per-element generation state and the results already seen for it, with a
 * subscription for observers. Knows nothing about scheduling: mutators leave
 * notifying to the caller so a batch of edits lands as one update.
 */
export class SnapshotStore {
	private state = new Map<string, ElementSnapshot>();
	private listeners = new Set<() => void>();
	private resultVersion = 0;

	constructor(initialState: Record<string, ElementSnapshot> = {}) {
		for (const [id, snap] of Object.entries(initialState)) {
			this.state.set(id, { ...snap, status: "idle", seconds: 0 });
		}
	}

	subscribe = (listener: () => void) => {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	};

	notify() {
		for (const listener of this.listeners) {
			listener();
		}
	}

	get = (id?: string): ElementSnapshot =>
		(id && this.state.get(id)) || EMPTY_SNAPSHOT;

	/** Bumps whenever any element's result changes, so observers can rederive. */
	getResultVersion = () => this.resultVersion;

	all = (): Record<string, ElementSnapshot> => Object.fromEntries(this.state);

	ids = (): string[] => Array.from(this.state.keys());

	isActive = (id: string): boolean => isGenerationActive(this.get(id).status);

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

	update(id: string, patch: Partial<ElementSnapshot>) {
		if ("result" in patch && patch.result !== this.get(id).result)
			this.resultVersion++;
		this.state.set(id, { ...this.get(id), ...patch });
	}

	/** Drops the live entry. Takes already generated survive: history is append-only. */
	remove(id: string) {
		if (this.state.get(id)?.result) this.resultVersion++;
		this.state.delete(id);
	}

	/** Clears in-flight progress, keeping whatever the element already had. */
	resetToIdle(id: string) {
		const { result, error, resultInputs, connectorType, pinned } = this.get(id);
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

	commit(
		id: string,
		result: AssetResult,
		inputs: GenerationInputs,
		connectorType: AssetConnectorType,
		pinned: boolean,
	): CommittedTake {
		this.update(id, {
			status: "idle",
			seconds: 0,
			result,
			error: null,
			resultInputs: inputs,
			connectorType,
			pinned,
		});
		return { elementId: id, connectorType, inputs, result, pinned };
	}
}
