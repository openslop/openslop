import { z } from "zod";
import { GenerationSnapshotSchema } from "@/lib/generation/snapshots";
import { createClient } from "@/lib/supabase/client";
import type { CanvasVersion, CanvasVersionStorage } from "./canvasHistory";
import { parseStoreSnapshot } from "./storeSnapshot";

const TABLE = "canvas_versions";

const LIST_LIMIT = 100;

const META_COLUMNS = "id, updated_at";

const MetaSchema = z.object({ id: z.string(), updated_at: z.string() });

const RowSchema = z.object({
	script: z.string(),
	store: z.unknown(),
	generation: GenerationSnapshotSchema,
});

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
			return z
				.array(MetaSchema)
				.parse(data ?? [])
				.map(toVersion);
		},

		async read(id) {
			const { data, error } = await createClient()
				.from(TABLE)
				.select("script, store, generation")
				.eq("id", id)
				.single();
			if (error) throw error;
			const row = RowSchema.parse(data);
			return {
				script: row.script,
				store: parseStoreSnapshot(row.store),
				generation: row.generation,
			};
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
