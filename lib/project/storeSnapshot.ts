import { z } from "zod";
import { connectorModelsSchema } from "@/lib/connectors/models";
import type { ProjectData, ProjectStore } from "./store";
import { ProjectSettingsSchema } from "./types";
import { VideoSettingsSchema } from "./videoSettings";

const ProjectStoreSnapshotSchema = z.object({
	videoSettings: VideoSettingsSchema,
	settings: ProjectSettingsSchema.default(ProjectSettingsSchema.parse({})),
	models: connectorModelsSchema.default({}),
}) satisfies z.ZodType<ProjectData>;

export function extractStoreSnapshot(store: ProjectStore): ProjectData {
	return ProjectStoreSnapshotSchema.parse(store.getState());
}

/** The `store` column is untyped JSON, parsed once here. */
export function parseStoreSnapshot(raw: unknown): ProjectData {
	return ProjectStoreSnapshotSchema.parse(raw ?? {});
}
