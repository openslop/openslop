import { notFound, redirect } from "next/navigation";
import { loadTranscript } from "@/lib/api/conversations";
import { listProviderKeys } from "@/lib/api/provider-keys";
import { rowId } from "@/lib/api/request-schema-fields";
import {
	SAVED_PROJECT_COLUMNS,
	parseSavedProject,
} from "@/lib/project/saved-project";
import { createClient } from "@/lib/supabase/server";
import { AccountSchema } from "@/lib/user/account";
import ProjectEditor from "./project-editor";

export default async function ProjectPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	if (!rowId.safeParse(id).success) notFound();

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
			.select(SAVED_PROJECT_COLUMNS)
			.eq("id", id)
			.maybeSingle(),
	]);

	if (!user) redirect("/");
	if (error) throw error;
	if (!project) notFound();

	const [providerKeys, transcript] = await Promise.all([
		listProviderKeys(user),
		loadTranscript(id, user.id),
	]);

	return (
		<ProjectEditor
			key={id}
			projectId={id}
			initial={parseSavedProject(project)}
			initialTranscript={transcript}
			account={AccountSchema.parse(user)}
			providerKeys={providerKeys}
		/>
	);
}
