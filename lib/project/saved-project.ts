import { z } from "zod";
import { GenerationSnapshotSchema } from "@/lib/generation/snapshots";
import { selectColumns } from "@/lib/supabase/select-columns";
import { ProjectDataSchema } from "./store";

/** A saved project, whether the project row or one of its versions. */
const SavedProjectSchema = z.object({
	script: z.string(),
	store: ProjectDataSchema,
	generation: GenerationSnapshotSchema,
});

export type SavedProject = z.infer<typeof SavedProjectSchema>;

export const SAVED_PROJECT_COLUMNS = selectColumns(SavedProjectSchema);

export const parseSavedProject = (raw: unknown): SavedProject =>
	SavedProjectSchema.parse(raw);
