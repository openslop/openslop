import type { ReactNode } from "react";
import type { CanvasElementType } from "@/lib/canvas/types";
import { getPrimaryUrl } from "@/lib/connectors/assetUrl";
import { AnimatedImagePreview } from "./AnimatedImagePreview";
import { AudioPreview, MediaResult } from "./results";
import type { ElementPreviewProps } from "./status";

type ElementPreview = (props: ElementPreviewProps) => ReactNode;

function ImagePreview({ result, ...state }: ElementPreviewProps) {
	return (
		<MediaResult
			{...state}
			url={getPrimaryUrl(result, "image")}
			outputKind="image"
		/>
	);
}

function ClipPreview({ result, ...state }: ElementPreviewProps) {
	return (
		<MediaResult
			{...state}
			url={getPrimaryUrl(result, "video")}
			outputKind="video"
		/>
	);
}

/** How each element type renders its generated output. */
export const ELEMENT_PREVIEWS: Record<CanvasElementType, ElementPreview> = {
	narration: AudioPreview,
	character: AudioPreview,
	sound: AudioPreview,
	music: AudioPreview,
	image: ImagePreview,
	clip: ClipPreview,
	animated_image: AnimatedImagePreview,
};
