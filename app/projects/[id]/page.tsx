import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProjectEditor from "./ProjectEditor";

export default async function ProjectPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const supabase = await createClient();
	// Both calls are round trips to Supabase and neither needs the other's
	// result: row access is enforced by RLS, not by the user read.
	const [
		{
			data: { user },
		},
		{ data: project, error },
	] = await Promise.all([
		supabase.auth.getUser(),
		supabase
			.from("projects")
			.select("id, script, store, generation")
			.eq("id", id)
			.maybeSingle(),
	]);

	if (!user) redirect("/");
	if (error) throw error;
	if (!project) notFound();

	return (
		<ProjectEditor
			key={project.id}
			projectId={project.id}
			initialScript={project.script ?? ""}
			initialStore={project.store}
			initialGeneration={project.generation}
			user={user}
		/>
	);
}
