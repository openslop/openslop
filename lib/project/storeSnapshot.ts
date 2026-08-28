import { z } from "zod";
import type { ProjectPersisted, ProjectStore } from "./store";
import { MetadataSchema } from "./types";

/** A new field on `ProjectPersisted` will not compile until it is added here too. */
const ProjectStoreSnapshotSchema = z.object({
	metadata: z.preprocess((value) => value ?? {}, MetadataSchema),
	referenceImages: z.array(z.string()).default([]),
}) satisfies z.ZodType<ProjectPersisted>;

export type ProjectStoreSnapshot = ProjectPersisted;

export function extractStoreSnapshot(
	store: ProjectStore,
): ProjectStoreSnapshot {
	const { metadata, referenceImages } = store.getState();
	return structuredClone({ metadata, referenceImages });
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
	store.setState({ ...snapshot, hydrated: true });
}

export function replaceStoreSnapshot(
	store: ProjectStore,
	snapshot: ProjectStoreSnapshot,
): void {
	store.setState(snapshot);
}
