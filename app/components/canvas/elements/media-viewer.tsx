"use client";

import { toast } from "sonner";
import { CloseButton } from "@/components/ui/close-button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "@/components/ui/dialog";
import { Link } from "@/components/ui/icon";
import { TooltipIconButton } from "@/components/ui/icon-button";
import { useReturnFocus } from "@/components/ui/return-focus";
import { Separator } from "@/components/ui/separator";
import { MediaWithSkeleton } from "@/lib/components/media-with-skeleton";
import { formatDateTime } from "@/lib/format";
import { toastError } from "@/lib/toast-error";

export type Viewed = {
	src: string;
	kind: "image" | "video";
	name: string;
	/** Where the media sits in the project, e.g. "Character". */
	context?: string;
	/** When the media was made, for media that records it. */
	createdAt?: string;
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
	open,
	onOpenChange,
}: Viewed & { open: boolean; onOpenChange: (open: boolean) => void }) {
	const returnFocus = useReturnFocus(open);
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				surface="elevated"
				// The first button is a tooltip trigger, which would take the first Escape.
				onOpenAutoFocus={(event) => {
					event.preventDefault();
					(event.currentTarget as HTMLElement).focus();
				}}
				onCloseAutoFocus={returnFocus}
				showCloseButton={false}
				className="max-w-4xl gap-2"
			>
				<div className="flex items-center justify-between gap-3">
					<div className="flex min-w-0 flex-col">
						<DialogTitle className="truncate text-label">{name}</DialogTitle>
						<DialogDescription className="text-label-xs">
							{[context, createdAt && `Created ${formatDateTime(createdAt)}`]
								.filter(Boolean)
								.join(" · ")}
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
