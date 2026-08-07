import { createClient } from "@/lib/supabase/client";
import type { ElementSnapshot } from "@/lib/generation/snapshots";
import type { ProjectStoreSnapshot } from "./storeSnapshot";

export type ProjectRow = {
	id: string;
	name: string;
	thumbnail_url: string | null;
	updated_at: string;
};

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
	return data;
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
