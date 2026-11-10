"use client";

import { useSlateStatic } from "slate-react";
import { Forbidden, Image, Transition } from "@/components/ui/icon";
import { keepFocus } from "@/components/ui/keep-focus";
import { Popover, PopoverContent } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Thumbnail,
	ThumbnailCaption,
	ThumbnailFace,
	THUMBNAIL_POPOVER_WIDTH,
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
import { AssetTile } from "../asset-tile";
import { MediaPicker } from "../media-picker";
import { AddButton } from "@/components/ui/add-button";
import { RemoveItem, TileMenu, useViewLarger } from "../tile-actions";
import type { AttributeTarget, LaidOutTarget } from "./attribute-target";
import { AttributePopoverSection, AttributeTrigger } from "./attribute-trigger";
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
	const viewer = useViewLarger(
		picture
			? {
					src: picture,
					kind: "image",
					name: label,
					context: "Start frame",
				}
			: undefined,
	);
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
			{(viewer.item || onRemove) && (
				<TileMenu label={label}>
					{viewer.item}
					{onRemove && <RemoveItem onSelect={onRemove} />}
				</TileMenu>
			)}
			{viewer.dialog}
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
function StartFrameOptions({ element, attrKey, label }: AttributeTarget) {
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

	return (
		<AttributePopoverSection
			title={label}
			action={
				<MediaPicker kind="image" onPick={(url) => setFrame(url, url)}>
					<AddButton label="Add start frame" />
				</MediaPicker>
			}
		>
			<TileRow columns={2} radiogroup={label}>
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
				{uploaded && (
					<FrameTile
						kind="upload"
						current={source.kind}
						onSelect={() => setFrame(uploaded)}
						picture={uploaded}
						onRemove={() => setFrame(NO_FRAME, null)}
					/>
				)}
			</TileRow>
		</AttributePopoverSection>
	);
}

/** A draft opens on a picture or on nothing: it has no scene before it to choose instead. */
export function DraftStartFrame({
	element,
	attrKey,
	label,
	Section,
}: LaidOutTarget) {
	const editor = useSlateStatic();
	const source = frameSource(element.generationAttributes?.[attrKey]);
	const setFrame = (url: string | null) =>
		mergeAttrs(editor, element.id, {
			[attrKey]: url ?? NO_FRAME,
			[UPLOADED_FRAME_ATTR]: url,
		});
	return (
		<Section
			title={label}
			action={
				<MediaPicker kind="image" onPick={setFrame}>
					<AddButton label="Add start frame" />
				</MediaPicker>
			}
		>
			{source.kind === "upload" && (
				<TileRow columns={2}>
					<AssetTile
						name={label}
						previewUrl={source.url}
						context="Start frame"
						Icon={Image}
						onRemove={() => setFrame(null)}
					/>
				</TileRow>
			)}
		</Section>
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
			<PopoverContent align="end" className={THUMBNAIL_POPOVER_WIDTH}>
				<StartFrameOptions {...target} />
			</PopoverContent>
		</Popover>
	);
}
