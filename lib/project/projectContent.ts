import { z } from "zod";
import { GenerationSnapshotSchema } from "@/lib/generation/snapshots";
import type { ProjectContent } from "./projectDocument";
import { ProjectDataSchema } from "./store";

/** A saved project, whether the project row or one of its versions. */
const ProjectContentSchema = z.object({
	script: z.string(),
	store: ProjectDataSchema,
	generation: GenerationSnapshotSchema,
}) satisfies z.ZodType<ProjectContent>;

/** Selected wherever saved content is read, so the query cannot drift from the schema. */
export const PROJECT_CONTENT_COLUMNS = Object.keys(
	ProjectContentSchema.shape,
).join(", ");

export const parseProjectContent = (raw: unknown): ProjectContent =>
	ProjectContentSchema.parse(raw);
