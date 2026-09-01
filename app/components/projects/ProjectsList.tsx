"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "@/components/ui/icon";
import { toastError } from "@/lib/toastError";
import { createProject, deleteProject } from "@/lib/project/api";
import type { ProjectRow } from "@/lib/project/api";
import UserProfile from "@/app/components/UserProfile";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { DotGrid } from "@/components/ui/dot-grid";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProjectCard } from "./ProjectCard";

export default function ProjectsList({
	initialProjects,
}: {
	initialProjects: ProjectRow[];
}) {
	const [projects, setProjects] = useState(initialProjects);
	const [deleting, setDeleting] = useState<ProjectRow>();
	const [pending, startTransition] = useTransition();
	const router = useRouter();

	const handleCreate = () => {
		startTransition(async () => {
			try {
				const project = await createProject();
				router.push(`/projects/${project.id}`);
			} catch (err) {
				toastError(err, "Could not create project");
			}
		});
	};

	const handleDelete = async (id: string) => {
		const previous = projects;
		setProjects((p) => p.filter((x) => x.id !== id));
		try {
			await deleteProject(id);
		} catch (err) {
			toastError(err, "Could not delete project");
			setProjects(previous);
		}
	};

	return (
		<TooltipProvider>
			<div className="relative min-h-screen bg-background text-foreground">
				<DotGrid placement="container" />
				<UserProfile />
				<div className="relative z-10 mx-auto max-w-7xl px-6 pt-20 pb-16">
					<header className="mb-10 flex items-end justify-between">
						<div>
							<h1 className="text-heading-lg font-semibold tracking-tight">
								My Slop
							</h1>
							<p className="mt-1 text-body text-muted-foreground">
								{projects.length === 0
									? "No projects yet — start your first slop."
									: `${projects.length} project${projects.length === 1 ? "" : "s"}`}
							</p>
						</div>
						<Button type="button" onClick={handleCreate} disabled={pending}>
							<Plus size={16} />
							New slop
						</Button>
					</header>

					<ul className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
						{projects.map((project) => (
							<ProjectCard
								key={project.id}
								project={project}
								onDelete={() => setDeleting(project)}
							/>
						))}
					</ul>
				</div>
			</div>
			<ConfirmDeleteDialog
				open={deleting !== undefined}
				onOpenChange={(open) => {
					if (!open) setDeleting(undefined);
				}}
				title={`Delete ${deleting?.name}?`}
				description="This permanently deletes the project and everything generated in it. It can't be undone."
				actionLabel="Delete project"
				onConfirm={() => {
					if (deleting) handleDelete(deleting.id);
					setDeleting(undefined);
				}}
			/>
		</TooltipProvider>
	);
}
