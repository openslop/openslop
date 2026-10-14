import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { selectColumns } from "@/lib/supabase/select-columns";
import type { CanvasVersion, CanvasVersionStorage } from "./canvas-history";
import { SAVED_PROJECT_COLUMNS, parseSavedProject } from "./saved-project";

const TABLE = "canvas_versions";

const LIST_LIMIT = 100;

const MetaSchema = z.object({ id: z.string(), updated_at: z.string() });

const META_COLUMNS = selectColumns(MetaSchema);

const toVersion = (row: z.infer<typeof MetaSchema>): CanvasVersion => ({
	id: row.id,
	updatedAt: row.updated_at,
});

export function canvasVersionStorage(projectId: string): CanvasVersionStorage {
	return {
		async list() {
			const { data, error } = await createClient()
				.from(TABLE)
				.select(META_COLUMNS)
				.eq("project_id", projectId)
				.order("created_at", { ascending: false })
				.limit(LIST_LIMIT);
			if (error) throw error;
			return z.array(MetaSchema).parse(data).map(toVersion);
		},

		async read(id) {
			const { data, error } = await createClient()
				.from(TABLE)
				.select(SAVED_PROJECT_COLUMNS)
				.eq("id", id)
				.single();
			if (error) throw error;
			return parseSavedProject(data);
		},

		async create(content) {
			const { data, error } = await createClient()
				.from(TABLE)
				.insert({ project_id: projectId, ...content })
				.select(META_COLUMNS)
				.single();
			if (error) throw error;
			return toVersion(MetaSchema.parse(data));
		},

		async update(id, content) {
			const { data, error } = await createClient()
				.from(TABLE)
				.update(content)
				.eq("id", id)
				.select(META_COLUMNS)
				.single();
			if (error) throw error;
			return toVersion(MetaSchema.parse(data));
		},
	};
}
