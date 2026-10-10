import { z } from "zod";
import { GenerationSnapshotSchema } from "@/lib/generation/snapshots";
import { ProjectDataSchema } from "./store";

/** A saved project, whether the project row or one of its versions. */
const SavedProjectSchema = z.object({
	script: z.string(),
	store: ProjectDataSchema,
	generation: GenerationSnapshotSchema,
});

export type SavedProject = z.infer<typeof SavedProjectSchema>;

/** Selected wherever saved content is read, so the query cannot drift from the schema. */
export const SAVED_PROJECT_COLUMNS = Object.keys(SavedProjectSchema.shape).join(
	", ",
);

export const parseSavedProject = (raw: unknown): SavedProject =>
	SavedProjectSchema.parse(raw);
