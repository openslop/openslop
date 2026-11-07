"use client";

import { Maximize2 } from "@/components/ui/icon";
import { ICON_SIZES, IconButton } from "@/components/ui/icon-button";
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { SimpleTooltip } from "@/components/ui/tooltip";
import { MediaWithSkeleton } from "@/lib/components/media-with-skeleton";
import { cn } from "@/lib/utils";

/** A thumbnail's full size, opened from its top-left corner. Callers pass the reveal classes. */
export function MediaViewer({
	src,
	kind,
	name,
	className,
}: {
	src: string;
	kind: "image" | "video";
	name: string;
	className?: string;
}) {
	return (
		<Dialog>
			<SimpleTooltip label="View larger">
				<DialogTrigger asChild>
					<IconButton
						ariaLabel={`View ${name} larger`}
						size="sm"
						chip
						className={cn(
							"absolute left-1 top-1 z-10 transition focus-visible:opacity-100",
							className,
						)}
					>
						<Maximize2 size={ICON_SIZES.sm} />
					</IconButton>
				</DialogTrigger>
			</SimpleTooltip>
			<DialogContent
				glow={false}
				aria-describedby={undefined}
				className="max-w-4xl p-2"
			>
				<DialogTitle className="sr-only">{name}</DialogTitle>
				<div className="relative h-[80dvh] overflow-hidden rounded-md">
					<MediaWithSkeleton
						outputKind={kind}
						src={src}
						alt={name}
						objectFit="contain"
						videoInteractive
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
}
