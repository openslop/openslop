import { z } from "zod";
import type { ProjectStore } from "./store";
import { MetadataSchema } from "./types";

const ProjectStoreSnapshotSchema = z.object({
	metadata: z.preprocess((value) => value ?? {}, MetadataSchema),
	referenceImages: z.array(z.string()).default([]),
});

export type ProjectStoreSnapshot = z.infer<typeof ProjectStoreSnapshotSchema>;

export function extractStoreSnapshot(
	store: ProjectStore,
): ProjectStoreSnapshot {
	const { metadata, referenceImages } = store.getState();
	return {
		metadata: structuredClone(metadata),
		referenceImages: [...referenceImages],
	};
}

/**
 * The `store` column is untyped JSON. Parse it into a complete snapshot once
 * here so callers can trust the types; a structurally wrong row throws.
 */
export function parseStoreSnapshot(raw: unknown): ProjectStoreSnapshot {
	return ProjectStoreSnapshotSchema.parse(raw ?? {});
}

export function applyStoreSnapshot(
	store: ProjectStore,
	snapshot: ProjectStoreSnapshot,
): void {
	if (store.getState().hydrated) return;
	replaceStoreSnapshot(store, snapshot);
	store.getState().markHydrated();
}

export function replaceStoreSnapshot(
	store: ProjectStore,
	snapshot: ProjectStoreSnapshot,
): void {
	const state = store.getState();
	state.reset();
	state.updateMetadata(snapshot.metadata);
	state.setReferenceImages(snapshot.referenceImages);
}
