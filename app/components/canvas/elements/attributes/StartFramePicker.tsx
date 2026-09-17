"use client";

import { useSlateStatic } from "slate-react";
import { Forbidden, ImagePlus, Transition } from "@/components/ui/icon";
import { Popover, PopoverContent } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { updateElementAttrs } from "@/app/components/canvas/utils/nodeOps";
import type { CanvasContentElement } from "@/lib/canvas/types";
import { MediaWithSkeleton } from "@/lib/components/MediaWithSkeleton";
import {
	NO_FRAME,
	PREVIOUS_VISUAL,
	START_FRAME,
	UPLOADED_FRAME_ATTR,
} from "@/lib/connectors/video/startFrame";
import { useImageUpload } from "@/lib/upload/useImageUpload";
import { cn } from "@/lib/utils";
import { AddAssetTile } from "../AddAssetTile";
import { RemoveCrossButton } from "../RemoveCrossButton";
import { AttributeTrigger } from "./AttributeTrigger";
import { usePreviousPictures } from "./usePreviousPictures";

function FrameTile({
	label,
	selected,
	onSelect,
	children,
}: {
	label: string;
	selected: boolean;
	onSelect: () => void;
	children: React.ReactNode;
}) {
	return (
		<button
			type="button"
			role="radio"
			aria-checked={selected}
			aria-label={label}
			onMouseDown={(e) => e.preventDefault()}
			onClick={onSelect}
			className="focus-ring flex w-16 flex-col gap-1 sm:w-20"
		>
			<div
				className={cn(
					"relative flex aspect-square items-center justify-center overflow-hidden rounded-md border bg-card text-muted-foreground",
					selected ? "border-accent ring-2 ring-accent" : "border-border",
				)}
			>
				{children}
			</div>
			<span className="truncate text-badge text-muted-foreground">{label}</span>
		</button>
	);
}

function PreviousVisualPreview({ element }: { element: CanvasContentElement }) {
	const previous = usePreviousPictures(element, [START_FRAME]);
	if (previous.kind === "loading")
		return (
			<Skeleton className="absolute inset-0 animate-none shimmer-surface" />
		);
	const [opening] = previous.kind === "ready" ? previous.pictures : [];
	if (!opening) return <Transition className="h-5 w-5" />;
	return <MediaWithSkeleton outputKind="image" src={opening.url} alt="" />;
}

/** An upload is kept while another choice is made so it can be chosen again. */
export function StartFramePicker({
	element,
	attrKey,
	label,
	hideLabel,
}: {
	element: CanvasContentElement;
	attrKey: string;
	label: string;
	hideLabel?: boolean;
}) {
	const editor = useSlateStatic();
	const frame = element.generationAttributes?.[attrKey] ?? NO_FRAME;
	const uploaded = element.layoutAttributes?.[UPLOADED_FRAME_ATTR];
	const usesPrevious = frame === PREVIOUS_VISUAL;
	const usesUpload = URL.canParse(frame);
	const setFrame = (next: string, upload = uploaded ?? null) =>
		updateElementAttrs(editor, element, {
			[attrKey]: next,
			[UPLOADED_FRAME_ATTR]: upload,
		});
	const { openPicker, uploading, inputElement } = useImageUpload({
		onUpload: ([url]) => url && setFrame(url, url),
	});
	const summary = usesUpload
		? "Uploaded picture"
		: usesPrevious
			? "Previous scene"
			: "None";

	return (
		<Popover>
			<AttributeTrigger tooltip={`${label}: ${summary}`}>
				{!hideLabel && <span className="opacity-70 mr-1">{label}</span>}
				{summary}
			</AttributeTrigger>
			<PopoverContent align="end" className="w-auto">
				<div role="radiogroup" aria-label={label} className="flex gap-3">
					<FrameTile
						label="None"
						selected={!usesUpload && !usesPrevious}
						onSelect={() => setFrame(NO_FRAME)}
					>
						<Forbidden className="h-5 w-5" />
					</FrameTile>
					<FrameTile
						label="Previous scene"
						selected={usesPrevious}
						onSelect={() => setFrame(PREVIOUS_VISUAL)}
					>
						<PreviousVisualPreview element={element} />
					</FrameTile>
					{uploaded ? (
						<div className="group/tile relative">
							<FrameTile
								label="Uploaded picture"
								selected={usesUpload}
								onSelect={() => setFrame(uploaded)}
							>
								<MediaWithSkeleton outputKind="image" src={uploaded} alt="" />
							</FrameTile>
							<RemoveCrossButton
								label="Remove uploaded picture"
								onClick={() => setFrame(NO_FRAME, null)}
								className="opacity-0 group-hover/tile:opacity-100"
							/>
						</div>
					) : (
						<AddAssetTile
							label="Upload picture"
							ariaLabel="Upload a picture to open on"
							Icon={ImagePlus}
							onClick={openPicker}
							disabled={uploading}
							busy={uploading}
						/>
					)}
				</div>
				{inputElement}
			</PopoverContent>
		</Popover>
	);
}
