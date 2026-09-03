import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import type { ElementSnapshot } from "@/lib/generation/snapshots";
import type { ProjectStoreSnapshot } from "./storeSnapshot";

const ProjectRowSchema = z.object({
	id: z.string(),
	name: z.string(),
	thumbnail_url: z.string().nullable(),
	updated_at: z.string(),
});

export type ProjectRow = z.infer<typeof ProjectRowSchema>;

export type SaveProjectInput = {
	name: string;
	script: string;
	store: ProjectStoreSnapshot;
	generation: Record<string, ElementSnapshot>;
	thumbnail_url: string | null;
};

export async function createProject(): Promise<ProjectRow> {
	const supabase = createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) throw new Error("Not authenticated");
	const { data, error } = await supabase
		.from("projects")
		.insert({ user_id: user.id })
		.select("id, name, thumbnail_url, updated_at")
		.single();
	if (error) throw error;
	return ProjectRowSchema.parse(data);
}

export async function deleteProject(id: string): Promise<void> {
	const supabase = createClient();
	const { error } = await supabase.from("projects").delete().eq("id", id);
	if (error) throw error;
}

export async function saveProject(
	id: string,
	input: SaveProjectInput,
): Promise<void> {
	const supabase = createClient();
	const { error } = await supabase.from("projects").update(input).eq("id", id);
	if (error) throw error;
}
