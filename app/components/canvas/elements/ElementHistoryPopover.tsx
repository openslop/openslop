"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CloseButton } from "@/components/ui/close-button";
import { AlertCircle, History, Pin, RotateCcw } from "@/components/ui/icon";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { SimpleTooltip } from "@/components/ui/tooltip";
import { truncateMiddle } from "@/lib/format";
import { useElementHistoryStore } from "@/lib/generation/ElementHistoryProvider";
import { useGenerationQueue } from "@/lib/generation/GenerationQueueProvider";
import { restoreElementVersion } from "@/lib/generation/restore";
import { versionKey, type ElementVersion } from "@/lib/generation/versions";
import { relativeTime } from "@/lib/project/relativeTime";
import { toastError } from "@/lib/toastError";
import { cn } from "@/lib/utils";
import {
	useElementHistory,
	useLoadElementHistory,
} from "../hooks/useElementHistory";
import { AudioPlayer } from "./AudioPlayer";
import { HeaderIconButton } from "./HeaderIconButton";
import { MediaWithSkeleton } from "./MediaWithSkeleton";

const PROMPT_LENGTH = 72;

const SKELETON_ROWS = [0, 1, 2];

const RULE = "-mx-3 my-2 data-[orientation=horizontal]:w-[calc(100%+1.5rem)]";

const Dot = () => (
	<span aria-hidden="true" className="text-muted-foreground">
		·
	</span>
);

function ElementVersionThumbnail({
	result,
}: {
	result: ElementVersion["result"];
}) {
	const src = result.videoUrl ?? result.imageUrl;
	if (!src) return null;
	return (
		<div className="relative aspect-video w-16 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
			<MediaWithSkeleton
				outputKind={result.videoUrl ? "video" : "image"}
				src={src}
				alt=""
			/>
		</div>
	);
}

function ElementVersionRow({
	version,
	label,
	active,
	onRestore,
}: {
	version: ElementVersion;
	label: string;
	active: boolean;
	onRestore: () => void;
}) {
	const { audioUrl } = version.result;
	return (
		<li
			aria-current={active}
			className={cn(
				"group flex flex-col gap-1 rounded-md px-2 py-1.5",
				active && "bg-secondary",
			)}
		>
			<div className="flex items-center gap-2.5">
				<ElementVersionThumbnail result={version.result} />
				<div className="flex min-w-0 flex-1 flex-col gap-0.5">
					<span className="flex items-center gap-1.5 text-label-xs text-foreground">
						<span
							className={cn("font-numeric", active && "text-accent")}
						>{`v${label}`}</span>
						<Dot />
						{version.pinned && <Pin className="h-3 w-3" />}
						{relativeTime(version.createdAt)}
					</span>
					<span className="w-full truncate text-label-xs text-muted-foreground">
						{version.inputs.prompt
							? truncateMiddle(version.inputs.prompt, PROMPT_LENGTH)
							: "No prompt"}
					</span>
				</div>
				{!active && (
					<Button
						type="button"
						variant="secondary"
						size="sm"
						className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
						onClick={onRestore}
					>
						<RotateCcw aria-hidden="true" />
						Restore
					</Button>
				)}
			</div>
			{audioUrl && (
				<div className="flex min-h-7 flex-wrap items-center gap-x-2 gap-y-1 [--waveform-height:1.25rem]">
					<AudioPlayer src={audioUrl} />
				</div>
			)}
		</li>
	);
}

function LoadingRows() {
	return (
		<div aria-busy="true" className="flex flex-col">
			<span className="sr-only">Loading history…</span>
			{SKELETON_ROWS.map((row) => (
				<div key={row} className="flex flex-col gap-1.5 px-2 py-2">
					<Skeleton className="h-3 w-28" />
					<Skeleton className="h-3 w-3/4" />
				</div>
			))}
		</div>
	);
}

/**
 * Versions are read on open, and the list that subscribes to them only mounts
 * while the popover is open, so no card watches versions it never shows.
 */
export function ElementHistoryPopover({
	elementId,
	onRestore,
}: {
	elementId: string;
	onRestore: (version: ElementVersion) => void;
}) {
	const loadHistory = useLoadElementHistory();
	const [open, setOpen] = useState(false);
	const close = () => setOpen(false);

	return (
		<Popover
			open={open}
			onOpenChange={(next) => {
				if (next) loadHistory(elementId);
				setOpen(next);
			}}
		>
			<SimpleTooltip label="Generation history">
				<PopoverTrigger asChild>
					<HeaderIconButton ariaLabel="Generation history">
						<History size={14} />
					</HeaderIconButton>
				</PopoverTrigger>
			</SimpleTooltip>
			<PopoverContent
				align="start"
				aria-label="Generation history"
				className="w-80 font-medium"
			>
				<div className="flex items-center justify-between">
					<span className="text-label font-semibold">Generation history</span>
					<CloseButton onClick={close} />
				</div>
				<Separator className={RULE} />
				<div
					aria-live="polite"
					className="-mx-1 flex max-h-80 flex-col overflow-y-auto overscroll-contain"
				>
					<ElementVersionList
						elementId={elementId}
						onRestore={onRestore}
						onClose={close}
					/>
				</div>
			</PopoverContent>
		</Popover>
	);
}

function ElementVersionList({
	elementId,
	onRestore,
	onClose,
}: {
	elementId: string;
	onRestore: (version: ElementVersion) => void;
	onClose: () => void;
}) {
	const { versions, status, activeIndex } = useElementHistory(elementId);
	const queue = useGenerationQueue();
	const history = useElementHistoryStore();

	const restore = (version: ElementVersion) => {
		restoreElementVersion(queue, history, version).catch((err: unknown) =>
			toastError(err, "Restoring this version failed"),
		);
		onRestore(version);
		onClose();
	};

	if (status === "failed")
		return (
			<p className="flex items-center gap-1.5 px-2 py-1.5 text-label-xs text-destructive">
				<AlertCircle className="h-3.5 w-3.5" />
				Could not load history. Close and reopen to try again.
			</p>
		);

	if (status === "loading") return <LoadingRows />;

	if (versions.length === 0)
		return (
			<p className="px-2 py-1.5 text-label-xs text-muted-foreground">
				No versions yet.
			</p>
		);

	return (
		<ul className="flex flex-col">
			{versions
				.map((version, index) => (
					<ElementVersionRow
						key={versionKey(version)}
						version={version}
						label={String(index + 1)}
						active={index === activeIndex}
						onRestore={() => restore(version)}
					/>
				))
				.reverse()}
		</ul>
	);
}
