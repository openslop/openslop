import Link from "next/link";
import type { ProjectRow } from "@/lib/project/api";
import { ImageWithShimmer } from "@/lib/components/image-with-shimmer";
import { DeleteButton } from "@/components/ui/delete-button";
import { relativeTime } from "@/lib/project/relative-time";
import { isVideoThumbnailUrl } from "@/lib/project/thumbnail";

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
						<ProjectThumbnail url={project.thumbnail_url} name={project.name} />
					</div>
				</Link>
				<div className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
					<DeleteButton
						ariaLabel={`Delete ${project.name}`}
						chip
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

function ProjectThumbnail({ url, name }: { url: string | null; name: string }) {
	const className =
		"object-cover transition-transform duration-500 ease-out group-hover:scale-105";
	if (!url) {
		return (
			<div className="absolute inset-0 flex items-center justify-center text-label text-muted-foreground">
				No preview
			</div>
		);
	}
	if (isVideoThumbnailUrl(url)) {
		return (
			<video
				src={url}
				aria-label={name}
				muted
				playsInline
				preload="metadata"
				className={`absolute inset-0 h-full w-full ${className}`}
			/>
		);
	}
	return (
		<ImageWithShimmer
			src={url}
			alt={name}
			fill
			sizes="(min-width: 1280px) 200px, (min-width: 768px) 25vw, 50vw"
			className={className}
		/>
	);
}
