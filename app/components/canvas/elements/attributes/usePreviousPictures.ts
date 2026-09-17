"use client";

import mapValues from "lodash/mapValues";
import { useEffect, useState } from "react";
import { useSlateSelector } from "slate-react";
import { getContentElements, previousVisual } from "@/lib/canvas/scenes";
import { ELEMENT_TYPES, type CanvasContentElement } from "@/lib/canvas/types";
import { getPrimaryUrl } from "@/lib/connectors/assetUrl";
import { previewFrames } from "@/lib/connectors/video/captureFrames";
import { FRAMES, type FrameKey } from "@/lib/connectors/video/startFrame";
import { useQueueSelector } from "@/lib/generation/GenerationQueueProvider";

export type Picture = { name: string; url: string };

export type PreviousPictures =
	| { kind: "loading" }
	| { kind: "empty"; reason: string }
	| { kind: "ready"; pictures: Picture[] };

type FrameUrls = Record<FrameKey, string>;

/** A video's frames as object URLs, null when they cannot decode, undefined while they do. */
function useDecodedFrames(videoUrl: string | undefined) {
	const [decoded, setDecoded] = useState<{
		src: string;
		urls: FrameUrls | null;
	}>();
	useEffect(() => {
		if (!videoUrl) return;
		let urls: string[] = [];
		let cancelled = false;
		previewFrames(videoUrl).then(
			(jpegs) => {
				if (cancelled) return;
				const frameUrls = mapValues(jpegs, (jpeg) => URL.createObjectURL(jpeg));
				urls = Object.values(frameUrls);
				setDecoded({ src: videoUrl, urls: frameUrls });
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

/** What the visual before an element hands on, previewed locally: the given frames of a video, in that order, or the image itself. */
export function usePreviousPictures(
	element: CanvasContentElement,
	frames: readonly FrameKey[],
): PreviousPictures {
	const source = useSlateSelector((editor) =>
		previousVisual(getContentElements(editor.children), element.id),
	);
	const outputKind = source && ELEMENT_TYPES[source.type].outputKind;
	const url = useQueueSelector((q) =>
		source && outputKind
			? getPrimaryUrl(q.getElementSnapshot(source.id).result, outputKind)
			: undefined,
	);
	const decoded = useDecodedFrames(outputKind === "video" ? url : undefined);

	if (!source)
		return { kind: "empty", reason: "Nothing comes before this video" };
	if (!url)
		return { kind: "empty", reason: "The previous scene hasn't generated" };
	if (outputKind !== "video")
		return { kind: "ready", pictures: [{ name: "Picture", url }] };
	if (decoded === undefined) return { kind: "loading" };
	if (!decoded)
		return { kind: "empty", reason: "Couldn't preview the previous scene" };
	return {
		kind: "ready",
		pictures: frames.map((frame) => ({
			name: FRAMES[frame].name,
			url: decoded[frame],
		})),
	};
}
