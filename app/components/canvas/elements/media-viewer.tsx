"use client";

import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { MediaWithSkeleton } from "@/lib/components/media-with-skeleton";

export type Viewed = { src: string; kind: "image" | "video"; name: string };

/** Opens the media large from the trigger given as `children`. */
export function MediaViewerDialog({
	src,
	kind,
	name,
	children,
}: Viewed & { children: React.ReactNode }) {
	return (
		<Dialog>
			<DialogTrigger asChild>{children}</DialogTrigger>
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
