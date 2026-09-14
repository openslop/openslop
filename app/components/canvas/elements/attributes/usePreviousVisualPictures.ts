"use client";

import { useEffect, useState } from "react";
import { useSlateSelector } from "slate-react";
import { getContentElements, previousVisual } from "@/lib/canvas/scenes";
import { ELEMENT_TYPES, type CanvasContentElement } from "@/lib/canvas/types";
import { getPrimaryUrl } from "@/lib/connectors/assetUrl";
import { previewFrames } from "@/lib/connectors/video/captureFrames";
import { useQueueSelector } from "@/lib/generation/GenerationQueueProvider";

/** The pictures the visual before an element hands on, previewed locally, in time order. */
export type PreviousPictures =
	| { kind: "loading" }
	| { kind: "empty"; reason: string }
	| { kind: "ready"; urls: string[] };

/** A video's frames as object URLs, null when they cannot decode, undefined while they do. */
function useDecodedFrames(videoUrl: string | undefined) {
	const [decoded, setDecoded] = useState<{
		src: string;
		urls: string[] | null;
	}>();
	useEffect(() => {
		if (!videoUrl) return;
		let urls: string[] = [];
		let cancelled = false;
		previewFrames(videoUrl).then(
			(jpegs) => {
				if (cancelled) return;
				urls = jpegs.map((jpeg) => URL.createObjectURL(jpeg));
				setDecoded({ src: videoUrl, urls });
			},
			// A preview that cannot decode says so; generating still fails loudly.
			() => !cancelled && setDecoded({ src: videoUrl, urls: null }),
		);
		return () => {
			cancelled = true;
			urls.forEach((url) => URL.revokeObjectURL(url));
		};
	}, [videoUrl]);
	return decoded && decoded.src === videoUrl ? decoded.urls : undefined;
}

/** A video's first, middle and last frames, or the image itself, once the visual before the element has generated. */
export function usePreviousVisualPictures(
	element: CanvasContentElement,
): PreviousPictures {
	const source = useSlateSelector((editor) =>
		previousVisual(getContentElements(editor.children), element.id),
	);
	const url = useQueueSelector((q) =>
		source
			? getPrimaryUrl(
					q.getElementSnapshot(source.id).result,
					ELEMENT_TYPES[source.type].outputKind,
				)
			: undefined,
	);
	const isVideo =
		source !== undefined && ELEMENT_TYPES[source.type].outputKind === "video";
	const frames = useDecodedFrames(isVideo ? url : undefined);

	if (!source)
		return { kind: "empty", reason: "Nothing comes before this video" };
	if (!url)
		return { kind: "empty", reason: "The previous scene hasn't generated" };
	if (!isVideo) return { kind: "ready", urls: [url] };
	if (frames === undefined) return { kind: "loading" };
	return frames
		? { kind: "ready", urls: frames }
		: { kind: "empty", reason: "Couldn't preview the previous scene" };
}
