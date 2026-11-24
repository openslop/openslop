"use client";

import mapValues from "lodash/mapValues";
import { useEffect, useState } from "react";
import { useSlateSelector } from "slate-react";
import { getContentElements, previousVisual } from "@/lib/canvas/scenes";
import type { GeneratedElement } from "@/lib/canvas/types";
import { previewFrames } from "@/lib/connectors/video/capture-frames";
import { type ClipRange, clipRange } from "@/lib/connectors/video/clip-range";
import { FRAMES, type FrameKey } from "@/lib/connectors/video/start-frame";
import { useQueueSelector } from "@/lib/generation/generation-queue-provider";

export type PreviousPictures =
	| { kind: "loading" }
	| { kind: "empty"; reason: string }
	| { kind: "ready"; pictures: { name: string; url: string }[] };

/** Null when the video cannot decode, undefined while it does. Only the part that plays is decoded. */
function useDecodedFrames(
	videoUrl: string | undefined,
	range: ClipRange | undefined,
) {
	const [frames, setFrames] = useState<Record<FrameKey, string> | null>();
	const startSec = range?.startSec;
	const endSec = range?.endSec;
	useEffect(() => {
		if (!videoUrl) return;
		let urls: string[] = [];
		let cancelled = false;
		previewFrames(
			videoUrl,
			startSec === undefined ? undefined : { startSec, endSec },
		).then(
			(jpegs) => {
				if (cancelled) return;
				const frameUrls = mapValues(jpegs, (jpeg) => URL.createObjectURL(jpeg));
				urls = Object.values(frameUrls);
				setFrames(frameUrls);
			},
			// A preview that cannot decode says so; generating still fails loudly.
			() => !cancelled && setFrames(null),
		);
		return () => {
			cancelled = true;
			urls.forEach((url) => URL.revokeObjectURL(url));
			setFrames(undefined);
		};
	}, [videoUrl, startSec, endSec]);
	return frames;
}

export function usePreviousPictures(
	element: GeneratedElement,
	frames: readonly FrameKey[],
): PreviousPictures {
	const source = useSlateSelector((editor) =>
		previousVisual(getContentElements(editor.children), element.id),
	);
	const result = useQueueSelector((q) =>
		source ? q.getElementSnapshot(source.id).result : undefined,
	);
	const decoded = useDecodedFrames(
		result?.videoUrl,
		source?.type === "video" ? clipRange(source) : undefined,
	);

	if (!source)
		return { kind: "empty", reason: "Nothing comes before this video" };
	if (result?.imageUrl)
		return {
			kind: "ready",
			pictures: [{ name: "Picture", url: result.imageUrl }],
		};
	if (!result?.videoUrl)
		return { kind: "empty", reason: "The previous scene hasn't generated" };
	if (decoded === undefined) return { kind: "loading" };
	if (decoded === null)
		return { kind: "empty", reason: "Couldn't preview the previous scene" };
	return {
		kind: "ready",
		pictures: frames.map((frame) => ({
			name: FRAMES[frame].name,
			url: decoded[frame],
		})),
	};
}
