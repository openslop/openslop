"use client";

import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { CloseButton } from "@/components/ui/close-button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "@/components/ui/dialog";
import { Link, Tag } from "@/components/ui/icon";
import { TooltipIconButton } from "@/components/ui/icon-button";
import { Separator } from "@/components/ui/separator";
import { MediaWithSkeleton } from "@/lib/components/media-with-skeleton";
import { formatCost, formatDateTime } from "@/lib/format";
import { toastError } from "@/lib/toast-error";

export type Viewed = {
	src: string;
	kind: "image" | "video";
	name: string;
	/** Where the media sits in the project, e.g. "Character". */
	context?: string;
	/** When the media was made, for media that records it. */
	createdAt?: string;
	/** What generating it cost, for media that records it. */
	costUsd?: number;
};

function ViewerActions({ src }: Pick<Viewed, "src">) {
	const copyLink = () =>
		navigator.clipboard.writeText(src).then(
			() => toast("Copied the link"),
			(error: unknown) => toastError(error, "Couldn't copy the link"),
		);
	return (
		<div className="flex shrink-0 items-center gap-1">
			<TooltipIconButton label="Copy link" onClick={copyLink}>
				<Link />
			</TooltipIconButton>
			<DialogClose asChild>
				<CloseButton />
			</DialogClose>
		</div>
	);
}

/** The media large, while `open`. */
export function MediaViewerDialog({
	src,
	kind,
	name,
	context,
	createdAt,
	costUsd,
	open,
	onOpenChange,
}: Viewed & { open: boolean; onOpenChange: (open: boolean) => void }) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				surface="elevated"
				// The first button is a tooltip trigger, which would take the first Escape.
				onOpenAutoFocus={(event) => {
					event.preventDefault();
					if (event.currentTarget instanceof HTMLElement)
						event.currentTarget.focus();
				}}
				showCloseButton={false}
				className="max-w-4xl gap-2"
			>
				<div className="flex items-center justify-between gap-3">
					<div className="flex min-w-0 flex-col">
						<DialogTitle className="truncate text-label">{name}</DialogTitle>
						<DialogDescription className="flex items-center gap-1.5 text-label-xs">
							<span className="truncate">
								{[context, createdAt && `Created ${formatDateTime(createdAt)}`]
									.filter(Boolean)
									.join(" · ")}
							</span>
							{costUsd !== undefined && (
								<Badge variant="muted" size="inlineXs">
									<Tag />
									<span>{formatCost(costUsd)}</span>
								</Badge>
							)}
						</DialogDescription>
					</div>
					<ViewerActions src={src} />
				</div>
				<Separator bleed />
				<div className="relative h-[75dvh] overflow-hidden rounded-md">
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
