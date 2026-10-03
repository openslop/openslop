import { z } from "zod";
import type { ProjectData, ProjectStore } from "./store";
import { VideoSettingsSchema } from "./videoSettings";

const ProjectStoreSnapshotSchema = z.object({
	videoSettings: VideoSettingsSchema,
}) satisfies z.ZodType<ProjectData>;

export function extractStoreSnapshot(store: ProjectStore): ProjectData {
	return structuredClone({ videoSettings: store.getState().videoSettings });
}

/** The `store` column is untyped JSON, parsed once here. */
export function parseStoreSnapshot(raw: unknown): ProjectData {
	return ProjectStoreSnapshotSchema.parse(raw ?? {});
}
