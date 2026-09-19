import type { ReactNode } from "react";
import type { ResultKind } from "@/lib/canvas/types";
import { getPrimaryUrl } from "@/lib/connectors/assetUrl";
import { AudioResultPreview } from "./AudioResultPreview";
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

function ImageResultPreview(props: ElementPreviewProps) {
	return renderMedia(props, "image");
}

function VideoResultPreview(props: ElementPreviewProps) {
	return renderMedia(props, "video");
}

/** How generated output of each kind renders. */
export const PREVIEWS_BY_KIND: Record<ResultKind, ElementPreview> = {
	audio: AudioResultPreview,
	image: ImageResultPreview,
	video: VideoResultPreview,
};
