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
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) redirect("/");

	const { data: project, error } = await supabase
		.from("projects")
		.select("id, script, store, generation")
		.eq("id", id)
		.maybeSingle();

	if (error || !project) notFound();

	return (
		<ProjectEditor
			projectId={project.id}
			initialScript={project.script ?? ""}
			initialStore={project.store}
			initialGeneration={project.generation}
			user={user}
		/>
	);
}
