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
import type { ContentElement } from "@/lib/canvas/types";
import { MediaWithSkeleton } from "@/lib/components/media-with-skeleton";
import {
	type FrameSource,
	frameSource,
	NO_FRAME,
	PREVIOUS_VISUAL,
	START_FRAME,
	UPLOADED_FRAME_ATTR,
} from "@/lib/connectors/video/start-frame";
import { useFileUpload } from "@/lib/upload/use-file-upload";
import { AddAssetTile } from "../add-asset-tile";
import { RemoveCrossButton } from "../remove-cross-button";
import { AttributeTrigger } from "./attribute-trigger";
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
	children,
}: {
	kind: FrameSource["kind"];
	current: FrameSource["kind"];
	onSelect: () => void;
	children: React.ReactNode;
}) {
	const selected = kind === current;
	const label = FRAME_SOURCE_LABEL[kind];
	return (
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
				<ThumbnailFace selected={selected}>{children}</ThumbnailFace>
				<ThumbnailCaption>{label}</ThumbnailCaption>
			</button>
		</Thumbnail>
	);
}

function PreviousVisualPreview({ element }: { element: ContentElement }) {
	const previous = usePreviousPictures(element, [START_FRAME]);
	if (previous.kind === "loading")
		return <Skeleton className="absolute inset-0" />;
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
	element: ContentElement;
	attrKey: string;
	label: string;
	hideLabel?: boolean;
}) {
	const editor = useSlateStatic();
	const opening = frameSource(element.generationAttributes?.[attrKey]);
	// Sloppy sets a picture as the start frame without remembering it as the upload.
	const uploaded =
		element.layoutAttributes?.[UPLOADED_FRAME_ATTR] ??
		(opening.kind === "upload" ? opening.url : undefined);
	const setFrame = (next: string, upload = uploaded ?? null) =>
		mergeAttrs(editor, element.id, {
			[attrKey]: next,
			[UPLOADED_FRAME_ATTR]: upload,
		});
	const { openPicker, uploading, inputElement } = useFileUpload({
		kind: "image",
		onUpload: ([url]) => {
			if (url) setFrame(url, url);
		},
	});
	const summary = FRAME_SOURCE_LABEL[opening.kind];

	return (
		<Popover>
			<AttributeTrigger tooltip={`${label}: ${summary}`}>
				{!hideLabel && <span className="opacity-70 mr-1">{label}</span>}
				{summary}
			</AttributeTrigger>
			<PopoverContent align="end" className="w-auto">
				<div role="radiogroup" aria-label={label} className="flex gap-3">
					<FrameTile
						kind="none"
						current={opening.kind}
						onSelect={() => setFrame(NO_FRAME)}
					>
						<Forbidden className="h-5 w-5" />
					</FrameTile>
					<FrameTile
						kind="previous"
						current={opening.kind}
						onSelect={() => setFrame(PREVIOUS_VISUAL)}
					>
						<PreviousVisualPreview element={element} />
					</FrameTile>
					{uploaded ? (
						<div className="group/tile relative">
							<FrameTile
								kind="upload"
								current={opening.kind}
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
