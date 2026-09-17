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

export type PreviousPictures =
	| { kind: "loading" }
	| { kind: "empty"; reason: string }
	| { kind: "ready"; pictures: { name: string; url: string }[] };

/** Null when the video cannot decode, undefined while it does. */
function useDecodedFrames(videoUrl: string | undefined) {
	const [frames, setFrames] = useState<Record<FrameKey, string> | null>();
	useEffect(() => {
		if (!videoUrl) return;
		let urls: string[] = [];
		let cancelled = false;
		previewFrames(videoUrl).then(
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
	}, [videoUrl]);
	return frames;
}

export function usePreviousPictures(
	element: CanvasContentElement,
	frames: readonly FrameKey[],
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
	const decoded = useDecodedFrames(isVideo ? url : undefined);

	if (!source)
		return { kind: "empty", reason: "Nothing comes before this video" };
	if (!url)
		return { kind: "empty", reason: "The previous scene hasn't generated" };
	if (!isVideo) return { kind: "ready", pictures: [{ name: "Picture", url }] };
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
