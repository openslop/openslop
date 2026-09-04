import { z } from "zod";
import { createEmitter } from "@/lib/store/emitter";
import { ASSET_CONNECTOR_TYPES, AssetResultSchema } from "../connectors/types";
import { GenerationInputsSchema } from "./inputs";
import type { CommittedVersion } from "./versions";

const GenerationStatusSchema = z.enum(["idle", "queued", "generating"]);

export type GenerationStatus = z.infer<typeof GenerationStatusSchema>;

const ElementSnapshotSchema = z.object({
	status: GenerationStatusSchema,
	seconds: z.number(),
	result: AssetResultSchema.nullable(),
	error: z.string().nullable(),
	resultInputs: GenerationInputsSchema.nullable(),
	connectorType: z.enum(ASSET_CONNECTOR_TYPES).nullable(),
	/** The result was supplied rather than generated, so it is never regenerated. */
	pinned: z.boolean(),
});

export type ElementSnapshot = z.infer<typeof ElementSnapshotSchema>;

/** The `generation` column is untyped JSON; parse it once at the boundary. */
export const GenerationSnapshotSchema = z.record(
	z.string(),
	ElementSnapshotSchema,
);

const EMPTY_SNAPSHOT: ElementSnapshot = {
	status: "idle",
	seconds: 0,
	result: null,
	error: null,
	resultInputs: null,
	connectorType: null,
	pinned: false,
};

const settled = (state: Record<string, ElementSnapshot>) =>
	new Map(
		Object.entries(state).map(([id, snap]) => [
			id,
			{ ...snap, status: "idle" as const, seconds: 0 },
		]),
	);

/** A generation is active from the moment it is queued until it settles. */
export const isGenerationActive = (status: GenerationStatus) =>
	status === "queued" || status === "generating";

/**
 * Per-element generation state and the results already seen for it, with a
 * subscription for observers. Knows nothing about scheduling: mutators leave
 * notifying to the caller so a batch of edits lands as one update.
 */
export class SnapshotStore {
	private state: Map<string, ElementSnapshot>;
	private readonly emitter = createEmitter();
	private resultVersion = 0;

	constructor(initialState: Record<string, ElementSnapshot> = {}) {
		this.state = settled(initialState);
	}

	replaceAll(state: Record<string, ElementSnapshot>) {
		this.state = settled(state);
		this.resultVersion++;
		this.notify();
	}

	subscribe = this.emitter.subscribe;

	notify = this.emitter.notify;

	get = (id?: string): ElementSnapshot =>
		(id && this.state.get(id)) || EMPTY_SNAPSHOT;

	/** Bumps whenever any element's result changes, so observers can rederive. */
	getResultVersion = () => this.resultVersion;

	all = (): Record<string, ElementSnapshot> => Object.fromEntries(this.state);

	ids = (): string[] => Array.from(this.state.keys());

	isActive = (id: string): boolean => isGenerationActive(this.get(id).status);

	isBusy = (): boolean =>
		Array.from(this.state.values()).some((s) => isGenerationActive(s.status));

	private count(predicate: (snap: ElementSnapshot) => boolean): number {
		return Array.from(this.state.values()).filter(predicate).length;
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

	commit(version: CommittedVersion): CommittedVersion {
		const { elementId, result, inputs, connectorType, pinned } = version;
		this.update(elementId, {
			status: "idle",
			seconds: 0,
			result,
			error: null,
			resultInputs: inputs,
			connectorType,
			pinned,
		});
		return version;
	}
}
