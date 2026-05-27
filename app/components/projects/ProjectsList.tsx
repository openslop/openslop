"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createProject, deleteProject } from "@/lib/project/api";
import type { ProjectRow } from "@/lib/project/api";
import { ImageWithShimmer } from "@/lib/components/ImageWithShimmer";
import UserProfile from "@/app/components/UserProfile";

function relativeTime(iso: string): string {
	const diff = Date.now() - new Date(iso).getTime();
	const minutes = Math.floor(diff / 60_000);
	if (minutes < 1) return "just now";
	if (minutes < 60) return `${minutes}m ago`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours}h ago`;
	const days = Math.floor(hours / 24);
	if (days < 30) return `${days}d ago`;
	return new Date(iso).toLocaleDateString();
}

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
		<div className="min-h-screen text-white">
			<div className="fixed left-4 top-4 z-[100]">
				<UserProfile />
			</div>
			<div className="max-w-5xl mx-auto px-6 pt-20 pb-16">
				<header className="flex items-end justify-between mb-10">
					<div>
						<h1 className="font-display text-4xl tracking-tight">My Slop</h1>
						<p className="text-white/60 text-sm mt-1">
							{projects.length === 0
								? "No projects yet — start your first slop."
								: `${projects.length} project${projects.length === 1 ? "" : "s"}`}
						</p>
					</div>
					<button
						type="button"
						onClick={handleCreate}
						disabled={pending}
						className="inline-flex items-center gap-2 rounded-full bg-white text-black px-4 py-2 text-sm font-medium hover:bg-white/90 disabled:opacity-50 transition-colors"
					>
						<Plus size={16} strokeWidth={2} />
						New slop
					</button>
				</header>

				<ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{projects.map((project) => (
						<li key={project.id}>
							<div className="group relative rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-colors overflow-hidden">
								<button
									type="button"
									onClick={() => router.push(`/projects/${project.id}`)}
									className="block w-full text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
								>
									<div className="relative aspect-video bg-white/[0.04]">
										{project.thumbnail_url ? (
											<ImageWithShimmer
												src={project.thumbnail_url}
												alt={project.name}
												fill
												sizes="(min-width: 1024px) 320px, (min-width: 640px) 50vw, 100vw"
												className="object-cover"
											/>
										) : (
											<div className="absolute inset-0 flex items-center justify-center text-white/30 text-xs">
												No preview
											</div>
										)}
									</div>
									<div className="p-4">
										<div className="text-sm font-medium truncate">
											{project.name}
										</div>
										<div className="text-xs text-white/50 mt-0.5">
											Edited {relativeTime(project.updated_at)}
										</div>
									</div>
								</button>
								<button
									type="button"
									onClick={() => handleDelete(project.id)}
									aria-label={`Delete ${project.name}`}
									className="absolute top-2 right-2 p-1.5 rounded-md bg-black/40 text-white/70 hover:text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
								>
									<Trash2 size={14} strokeWidth={1.5} />
								</button>
							</div>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}
