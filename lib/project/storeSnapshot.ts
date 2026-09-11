import { z } from "zod";
import type { ProjectData, ProjectStore } from "./store";
import { MetadataSchema } from "./types";

/** A new field on `ProjectData` will not compile until it is added here too. */
const ProjectStoreSnapshotSchema = z.object({
	metadata: z.preprocess((value) => value ?? {}, MetadataSchema),
	referenceImages: z.array(z.string()).default([]),
}) satisfies z.ZodType<ProjectData>;

export function extractStoreSnapshot(store: ProjectStore): ProjectData {
	const { metadata, referenceImages } = store.getState();
	return structuredClone({ metadata, referenceImages });
}

/**
 * The `store` column is untyped JSON. Parse it into a complete snapshot once
 * here so callers can trust the types; a structurally wrong row throws.
 */
export function parseStoreSnapshot(raw: unknown): ProjectData {
	return ProjectStoreSnapshotSchema.parse(raw ?? {});
}
