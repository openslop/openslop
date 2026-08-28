import { z } from "zod";
import {
	ASSET_CONNECTOR_TYPES,
	type AssetConnectorType,
	type AssetResult,
} from "../connectors/types";
import type { GenerationInputs } from "./inputs";
import type { CommittedVersion } from "./versions";

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

export const GenerationInputsSchema = z.object({
	prompt: z.string(),
	attributes: z.record(z.string(), z.union([z.string(), z.number()])),
	dependencies: z.record(z.string(), z.string()),
}) satisfies z.ZodType<GenerationInputs>;

export const AssetResultSchema = z.object({
	durationSec: z.number(),
	imageUrl: z.string().optional(),
	audioUrl: z.string().optional(),
	videoUrl: z.string().optional(),
	textTimestamps: z
		.array(z.object({ text: z.string(), start: z.number(), end: z.number() }))
		.optional(),
}) satisfies z.ZodType<AssetResult>;

const ElementSnapshotSchema = z.object({
	status: z.enum(["idle", "queued", "generating"]),
	seconds: z.number(),
	result: AssetResultSchema.nullable(),
	error: z.string().nullable(),
	resultInputs: GenerationInputsSchema.nullable(),
	connectorType: z.enum(ASSET_CONNECTOR_TYPES).nullable(),
	pinned: z.boolean(),
}) satisfies z.ZodType<ElementSnapshot>;

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
	private listeners = new Set<() => void>();
	private resultVersion = 0;

	constructor(initialState: Record<string, ElementSnapshot> = {}) {
		this.state = settled(initialState);
	}

	replaceAll(state: Record<string, ElementSnapshot>) {
		this.state = settled(state);
		this.resultVersion++;
		this.notify();
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
