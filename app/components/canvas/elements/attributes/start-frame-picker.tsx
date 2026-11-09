"use client";

import { useSlateStatic } from "slate-react";
import { Forbidden, ImagePlus, Transition } from "@/components/ui/icon";
import { keepFocus } from "@/components/ui/keep-focus";
import { Popover, PopoverContent } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Thumbnail,
	ThumbnailCaption,
	ThumbnailFace,
} from "@/components/ui/thumbnail";
import { mergeAttrs } from "@/lib/canvas/editor-ops";
import { isContentElement } from "@/lib/canvas/guards";
import type { GeneratedElement } from "@/lib/canvas/types";
import { MediaWithSkeleton } from "@/lib/components/media-with-skeleton";
import {
	type FrameSource,
	frameSource,
	NO_FRAME,
	PREVIOUS_VISUAL,
	START_FRAME,
	UPLOADED_FRAME_ATTR,
} from "@/lib/connectors/video/start-frame";
import { useMediaUpload } from "@/lib/project/use-media-upload";
import { AddAssetTile } from "../add-asset-tile";
import { RemoveAction, TileActions, ViewLargerAction } from "../tile-actions";
import type { AttributeTarget, LaidOutTarget } from "./attribute-target";
import { AttributeTrigger } from "./attribute-trigger";
import { TileRow } from "./tile-row";
import { usePreviousPictures } from "./use-previous-pictures";

const FRAME_SOURCE_LABEL: Record<FrameSource["kind"], string> = {
	none: "None",
	previous: "Previous scene",
	upload: "Uploaded picture",
};

function FrameTile({
	kind,
	current,
	onSelect,
	picture,
	onRemove,
	children,
}: {
	kind: FrameSource["kind"];
	current: FrameSource["kind"];
	onSelect: () => void;
	picture?: string;
	onRemove?: () => void;
	children?: React.ReactNode;
}) {
	const selected = kind === current;
	const label = FRAME_SOURCE_LABEL[kind];
	return (
		<div className="group/tile relative">
			<Thumbnail asChild>
				<button
					type="button"
					role="radio"
					aria-checked={selected}
					aria-label={label}
					onMouseDown={keepFocus}
					onClick={onSelect}
					className="focus-ring"
				>
					<ThumbnailFace selected={selected}>
						{picture ? (
							<MediaWithSkeleton outputKind="image" src={picture} alt="" />
						) : (
							children
						)}
					</ThumbnailFace>
					<ThumbnailCaption>{label}</ThumbnailCaption>
				</button>
			</Thumbnail>
			<TileActions label={label}>
				{picture && (
					<ViewLargerAction src={picture} kind="image" name={label} />
				)}
				{onRemove && (
					<RemoveAction name={label.toLowerCase()} onClick={onRemove} />
				)}
			</TileActions>
		</div>
	);
}

function PreviousFrameTile({
	element,
	current,
	onSelect,
}: {
	element: GeneratedElement;
	current: FrameSource["kind"];
	onSelect: () => void;
}) {
	const previous = usePreviousPictures(element, [START_FRAME]);
	const [opening] = previous.kind === "ready" ? previous.pictures : [];
	return (
		<FrameTile
			kind="previous"
			current={current}
			onSelect={onSelect}
			picture={opening?.url}
		>
			{previous.kind === "loading" ? (
				<Skeleton className="absolute inset-0" />
			) : (
				<Transition className="h-5 w-5" />
			)}
		</FrameTile>
	);
}

/** An upload is kept while another choice is made so it can be chosen again. */
export function StartFrameOptions({
	element,
	attrKey,
	label,
	columns,
}: LaidOutTarget) {
	const editor = useSlateStatic();
	const source = frameSource(element.generationAttributes?.[attrKey]);
	// Sloppy sets a picture as the start frame without remembering it as the upload.
	const uploaded =
		element.layoutAttributes?.[UPLOADED_FRAME_ATTR] ??
		(source.kind === "upload" ? source.url : undefined);
	const setFrame = (next: string, upload = uploaded ?? null) =>
		mergeAttrs(editor, element.id, {
			[attrKey]: next,
			[UPLOADED_FRAME_ATTR]: upload,
		});
	const { openPicker, uploading, inputElement } = useMediaUpload({
		kinds: ["image"],
		onUpload: ([url]) => {
			if (url) setFrame(url, url);
		},
	});

	return (
		<>
			<TileRow columns={columns} radiogroup={label}>
				<FrameTile
					kind="none"
					current={source.kind}
					onSelect={() => setFrame(NO_FRAME)}
				>
					<Forbidden className="h-5 w-5" />
				</FrameTile>
				{isContentElement(element) && (
					<PreviousFrameTile
						element={element}
						current={source.kind}
						onSelect={() => setFrame(PREVIOUS_VISUAL)}
					/>
				)}
				{uploaded ? (
					<FrameTile
						kind="upload"
						current={source.kind}
						onSelect={() => setFrame(uploaded)}
						picture={uploaded}
						onRemove={() => setFrame(NO_FRAME, null)}
					/>
				) : (
					<AddAssetTile
						label="Upload"
						ariaLabel="Upload a picture to open on"
						Icon={ImagePlus}
						onClick={openPicker}
						disabled={uploading}
						busy={uploading}
					/>
				)}
			</TileRow>
			{inputElement}
		</>
	);
}

export function StartFramePicker(target: AttributeTarget) {
	const { kind } = frameSource(
		target.element.generationAttributes?.[target.attrKey],
	);
	const summary = FRAME_SOURCE_LABEL[kind];
	return (
		<Popover>
			<AttributeTrigger tooltip={`${target.label}: ${summary}`}>
				{summary}
			</AttributeTrigger>
			<PopoverContent align="end" className="w-auto">
				<StartFrameOptions {...target} />
			</PopoverContent>
		</Popover>
	);
}
