import type { ReactNode } from "react";
import {
	ELEMENT_TYPES,
	type CanvasElementType,
	type ResultKind,
} from "@/lib/canvas/types";
import { getPrimaryUrl } from "@/lib/connectors/assetUrl";
import { AnimatedImagePreview } from "./AnimatedImagePreview";
import { AudioPreview } from "./AudioPreview";
import { MediaResult } from "./results";
import type { ElementPreviewProps } from "./status";

type ElementPreview = (props: ElementPreviewProps) => ReactNode;

function renderMedia(
	{ result, ...state }: ElementPreviewProps,
	outputKind: "image" | "video",
) {
	return (
		<MediaResult
			{...state}
			url={getPrimaryUrl(result, outputKind)}
			outputKind={outputKind}
		/>
	);
}

function ImagePreview(props: ElementPreviewProps) {
	return renderMedia(props, "image");
}

function VideoPreview(props: ElementPreviewProps) {
	return renderMedia(props, "video");
}

/** How generated output of each kind renders. */
const PREVIEWS_BY_KIND: Record<ResultKind, ElementPreview> = {
	audio: AudioPreview,
	image: ImagePreview,
	video: VideoPreview,
};

/** Element types whose preview is more than their output kind. */
const PREVIEW_OVERRIDES: Partial<Record<CanvasElementType, ElementPreview>> = {
	animated_image: AnimatedImagePreview,
};

export const ELEMENT_PREVIEWS = Object.fromEntries(
	(Object.keys(ELEMENT_TYPES) as CanvasElementType[]).map((type) => [
		type,
		PREVIEW_OVERRIDES[type] ?? PREVIEWS_BY_KIND[ELEMENT_TYPES[type].outputKind],
	]),
) as Record<CanvasElementType, ElementPreview>;
