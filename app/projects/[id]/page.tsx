import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { listProviderKeys } from "@/lib/api/providerKeys";
import {
	PROJECT_CONTENT_COLUMNS,
	parseProjectContent,
} from "@/lib/project/projectContent";
import { createClient } from "@/lib/supabase/server";
import ProjectEditor from "./ProjectEditor";

export default async function ProjectPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	// A malformed id makes Postgres throw on the cast; guid() matches every shape it accepts.
	if (!z.guid().safeParse(id).success) notFound();

	const supabase = await createClient();
	// Safe to run concurrently: row access is enforced by RLS, not by this user read.
	const [
		{
			data: { user },
		},
		{ data: project, error },
	] = await Promise.all([
		supabase.auth.getUser(),
		supabase
			.from("projects")
			.select(PROJECT_CONTENT_COLUMNS)
			.eq("id", id)
			.maybeSingle(),
	]);

	if (!user) redirect("/");
	if (error) throw error;
	if (!project) notFound();

	return (
		<ProjectEditor
			key={id}
			projectId={id}
			initial={parseProjectContent(project)}
			user={user}
			providerKeys={await listProviderKeys(user)}
		/>
	);
}
