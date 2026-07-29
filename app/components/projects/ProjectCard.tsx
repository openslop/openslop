import Link from "next/link";
import type { ProjectRow } from "@/lib/project/api";
import { ImageWithShimmer } from "@/lib/components/ImageWithShimmer";
import { DeleteButton } from "@/components/ui/delete-button";
import { relativeTime } from "@/lib/project/relativeTime";

export function ProjectCard({
	project,
	onDelete,
}: {
	project: ProjectRow;
	onDelete: () => void;
}) {
	const href = `/projects/${project.id}`;

	return (
		<li className="group">
			<div className="relative">
				<Link
					href={href}
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
							<div className="absolute inset-0 flex items-center justify-center text-label text-muted-foreground">
								No preview
							</div>
						)}
					</div>
				</Link>
				<div className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
					<DeleteButton
						ariaLabel={`Delete ${project.name}`}
						onClick={onDelete}
					/>
				</div>
			</div>
			<Link href={href} className="mt-2 block w-full text-left">
				<div className="truncate text-body font-semibold text-foreground">
					{project.name}
				</div>
				<div
					className="mt-0.5 truncate text-label text-muted-foreground"
					suppressHydrationWarning
				>
					Edited {relativeTime(project.updated_at)}
				</div>
			</Link>
		</li>
	);
}
