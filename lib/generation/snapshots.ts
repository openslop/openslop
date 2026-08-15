import mapKeys from "lodash/mapKeys";
import type { AssetConnectorType, AssetResult } from "../connectors/types";
import { rekeyDerivedId } from "./graph";
import { serializeInputs, type GenerationInputs } from "./inputs";

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

type HistoryEntry = { inputs: GenerationInputs; result: AssetResult };

type Rekey = (id: string) => string;

const rekeyInputs = (
	inputs: GenerationInputs,
	rekey: Rekey,
): GenerationInputs => ({
	...inputs,
	dependencies: mapKeys(inputs.dependencies, (_, id) => rekey(id)),
});

/**
 * Per-element generation state and the results already seen for it, with a
 * subscription for observers. Knows nothing about scheduling: mutators leave
 * notifying to the caller so a batch of edits lands as one update.
 */
export class SnapshotStore {
	private state = new Map<string, ElementSnapshot>();
	private history = new Map<string, Map<string, HistoryEntry>>();
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

	/**
	 * Clones one element's result and the results already seen for it onto
	 * another id. In-flight progress is never carried over, so a copy taken
	 * mid-generation lands idle rather than as a second active job.
	 *
	 * The nodes the graph derived from the element come along, rekeyed onto the
	 * copy: they are what the copy will depend on, so leaving them behind would
	 * land it stale and missing the parts they produced.
	 */
	copy(fromId: string, toId: string) {
		const rekey: Rekey = (id) =>
			id === fromId ? toId : rekeyDerivedId(id, fromId, toId);
		for (const id of Array.from(this.state.keys())) {
			const nextId = rekey(id);
			if (nextId !== id) this.copyEntry(id, nextId, rekey);
		}
	}

	private copyEntry(id: string, nextId: string, rekey: Rekey) {
		const source = this.get(id);
		this.update(nextId, {
			...source,
			status: "idle",
			seconds: 0,
			resultInputs:
				source.resultInputs && rekeyInputs(source.resultInputs, rekey),
		});
		const sourceHistory = this.history.get(id);
		if (!sourceHistory) return;
		this.history.set(
			nextId,
			new Map(
				Array.from(sourceHistory.values(), ({ inputs, result }) => {
					const rekeyed = rekeyInputs(inputs, rekey);
					return [serializeInputs(rekeyed), { inputs: rekeyed, result }];
				}),
			),
		);
	}

	/** Drops the entry entirely; anything it held is gone. */
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
	) {
		const elHistory = this.history.get(id) ?? new Map<string, HistoryEntry>();
		elHistory.set(serializeInputs(inputs), { inputs, result });
		this.history.set(id, elHistory);
		this.update(id, {
			status: "idle",
			seconds: 0,
			result,
			error: null,
			resultInputs: inputs,
			connectorType,
			pinned,
		});
	}

	/** Reinstates a result already generated for exactly these inputs. */
	restore(id: string, inputs: GenerationInputs): boolean {
		const cached = this.history.get(id)?.get(serializeInputs(inputs));
		if (!cached) return false;
		this.update(id, {
			result: cached.result,
			error: null,
			resultInputs: inputs,
		});
		return true;
	}
}
