import { createClient } from "@/lib/supabase/server";

/** Whether the signed-in user may attach work to the project: under RLS, someone else's project is not there. */
export async function ownsProject(projectId: string): Promise<boolean> {
	const supabase = await createClient();
	const { data, error } = await supabase
		.from("projects")
		.select("id")
		.eq("id", projectId)
		.maybeSingle();
	if (error) throw new Error(`Failed to load project: ${error.message}`);
	return data !== null;
}
