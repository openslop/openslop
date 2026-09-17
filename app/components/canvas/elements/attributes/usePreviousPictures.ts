"use client";

import mapValues from "lodash/mapValues";
import { useEffect, useState } from "react";
import { useSlateSelector } from "slate-react";
import { getContentElements, previousVisual } from "@/lib/canvas/scenes";
import type { CanvasContentElement } from "@/lib/canvas/types";
import type { AssetResult } from "@/lib/connectors/types";
import { previewFrames } from "@/lib/connectors/video/captureFrames";
import { FRAMES, type FrameKey } from "@/lib/connectors/video/startFrame";
import { useQueueSelector } from "@/lib/generation/GenerationQueueProvider";

type Picture = { name: string; url: string };

export type PreviousPictures =
	| { kind: "loading" }
	| { kind: "empty"; reason: string }
	| { kind: "ready"; pictures: Picture[] };

/** The image itself, or a video's frames: null when they cannot decode, undefined while they do. */
function usePictures(
	result: AssetResult | null,
	frames: readonly FrameKey[],
): Picture[] | null | undefined {
	const videoUrl = result?.videoUrl;
	const [decoded, setDecoded] = useState<Record<FrameKey, string> | null>();
	useEffect(() => {
		if (!videoUrl) return;
		let urls: string[] = [];
		let cancelled = false;
		previewFrames(videoUrl).then(
			(jpegs) => {
				if (cancelled) return;
				const frameUrls = mapValues(jpegs, (jpeg) => URL.createObjectURL(jpeg));
				urls = Object.values(frameUrls);
				setDecoded(frameUrls);
			},
			// A preview that cannot decode says so; generating still fails loudly.
			() => !cancelled && setDecoded(null),
		);
		return () => {
			cancelled = true;
			urls.forEach((url) => URL.revokeObjectURL(url));
			setDecoded(undefined);
		};
	}, [videoUrl]);

	if (result?.imageUrl) return [{ name: "Picture", url: result.imageUrl }];
	return (
		decoded &&
		frames.map((frame) => ({ name: FRAMES[frame].name, url: decoded[frame] }))
	);
}

export function usePreviousPictures(
	element: CanvasContentElement,
	frames: readonly FrameKey[],
): PreviousPictures {
	const source = useSlateSelector((editor) =>
		previousVisual(getContentElements(editor.children), element.id),
	);
	const result = useQueueSelector((q) =>
		source ? q.getElementSnapshot(source.id).result : null,
	);
	const pictures = usePictures(result, frames);

	if (!source)
		return { kind: "empty", reason: "Nothing comes before this video" };
	if (!result?.imageUrl && !result?.videoUrl)
		return { kind: "empty", reason: "The previous scene hasn't generated" };
	if (pictures === undefined) return { kind: "loading" };
	if (pictures === null)
		return { kind: "empty", reason: "Couldn't preview the previous scene" };
	return { kind: "ready", pictures };
}
