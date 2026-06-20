"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "@/components/ui/icon";
import { toast } from "sonner";
import { createProject, deleteProject } from "@/lib/project/api";
import type { ProjectRow } from "@/lib/project/api";
import { ImageWithShimmer } from "@/lib/components/ImageWithShimmer";
import UserProfile from "@/app/components/UserProfile";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/ui/delete-button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { relativeTime } from "@/lib/project/relativeTime";

export default function ProjectsList({
	initialProjects,
}: {
	initialProjects: ProjectRow[];
}) {
	const [projects, setProjects] = useState(initialProjects);
	const [pending, startTransition] = useTransition();
	const router = useRouter();

	const handleCreate = () => {
		startTransition(async () => {
			try {
				const project = await createProject();
				router.push(`/projects/${project.id}`);
			} catch (err) {
				console.error(err);
				toast.error("Could not create project");
			}
		});
	};

	const handleDelete = async (id: string) => {
		const previous = projects;
		setProjects((p) => p.filter((x) => x.id !== id));
		try {
			await deleteProject(id);
		} catch (err) {
			console.error(err);
			toast.error("Could not delete project");
			setProjects(previous);
		}
	};

	return (
		<TooltipProvider>
			<div className="relative min-h-screen bg-background text-foreground">
				<div
					aria-hidden
					className="dot-grid-bg pointer-events-none absolute inset-0 z-0"
				/>
				<UserProfile />
				<div className="relative z-10 mx-auto max-w-7xl px-6 pt-20 pb-16">
					<header className="mb-10 flex items-end justify-between">
						<div>
							<h1 className="text-4xl font-semibold tracking-tight">My Slop</h1>
							<p className="mt-1 text-sm text-muted-foreground">
								{projects.length === 0
									? "No projects yet — start your first slop."
									: `${projects.length} project${projects.length === 1 ? "" : "s"}`}
							</p>
						</div>
						<Button type="button" onClick={handleCreate} disabled={pending}>
							<Plus size={16} strokeWidth={1.5} />
							New slop
						</Button>
					</header>

					<ul className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
						{projects.map((project) => (
							<li key={project.id} className="group">
								<div className="relative">
									<button
										type="button"
										onClick={() => router.push(`/projects/${project.id}`)}
										aria-label={`Open ${project.name}`}
										className="block w-full overflow-hidden rounded-lg bg-muted focus-ring"
									>
										<div className="relative aspect-square">
											{project.thumbnail_url ? (
												<ImageWithShimmer
													src={project.thumbnail_url}
													alt={project.name}
													fill
													sizes="(min-width: 1280px) 200px, (min-width: 768px) 25vw, 50vw"
													className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
												/>
											) : (
												<div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
													No preview
												</div>
											)}
										</div>
									</button>
									<div className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
										<DeleteButton
											ariaLabel={`Delete ${project.name}`}
											onClick={() => handleDelete(project.id)}
										/>
									</div>
								</div>
								<button
									type="button"
									onClick={() => router.push(`/projects/${project.id}`)}
									className="mt-2 block w-full text-left"
								>
									<div className="truncate text-sm font-semibold text-foreground">
										{project.name}
									</div>
									<div
										className="mt-0.5 truncate text-xs text-muted-foreground"
										suppressHydrationWarning
									>
										Edited {relativeTime(project.updated_at)}
									</div>
								</button>
							</li>
						))}
					</ul>
				</div>
			</div>
		</TooltipProvider>
	);
}
