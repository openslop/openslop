"use client";

import { useRef, useState } from "react";
import isMatch from "lodash/isMatch";
import round from "lodash/round";
import { useSlateStatic } from "slate-react";
import { mergeAttrs } from "@/lib/canvas/editor-ops";
import { usePointerDrag } from "@/lib/components/use-pointer-drag";
import {
	isTrimmable,
	isTrimmed,
	playedSec,
	trimEdge,
	type Trim,
	type TrimEdge,
} from "@/lib/render/clip-trim";
import type { TimelineClip } from "./timeline-rows";

// The layout snaps whatever is stored onto the frame grid.
const toAttr = (sec: number) => String(round(sec, 2));

function useEdgeDrag(
	pxPerSec: number,
	onTrim: (deltaSec: number) => void,
	onEnd: () => void,
) {
	const originX = useRef(0);
	return usePointerDrag({
		onStart: (event) => {
			event.preventDefault();
			originX.current = event.clientX;
		},
		onMove: (event) => onTrim((event.clientX - originX.current) / pxPerSec),
		onEnd,
	});
}

/** A drag previews the new length and commits it on release: one layout rebuild, one undo step. */
export function useClipTrim(
	{ element, duration }: TimelineClip,
	pxPerSec: number,
	floorSec: number,
) {
	const editor = useSlateStatic();
	const [preview, setPreview] = useState<Trim | null>(null);
	const resting = trimEdge(element, "end", 0, floorSec);

	const trimBy = (edge: TrimEdge) => (deltaSec: number) =>
		setPreview(trimEdge(element, edge, deltaSec, floorSec));

	const commit = () => {
		setPreview(null);
		if (!preview || isMatch(resting, preview)) return;
		mergeAttrs(editor, element.id, {
			trimStart: toAttr(preview.trimStartSec),
			timelineDuration: toAttr(preview.durationSec),
		});
	};

	const handles = {
		start: useEdgeDrag(pxPerSec, trimBy("start"), commit),
		end: useEdgeDrag(pxPerSec, trimBy("end"), commit),
	};

	const trim = preview ?? resting;
	// The drawn span can differ from the clip's own length (overlays, cross-fades), so preview the change.
	const durationSec =
		duration + (preview ? preview.durationSec - resting.durationSec : 0);

	return {
		durationSec,
		/** How much of the span the footage covers; a scene can hold a video past it. */
		playedSec: Math.min(
			playedSec({ mediaDurationSec: element.mediaDurationSec, ...trim }),
			durationSec,
		),
		trim,
		handleProps: isTrimmable(element) ? handles : null,
		reset: isTrimmed(element)
			? () =>
					mergeAttrs(editor, element.id, {
						trimStart: null,
						timelineDuration: null,
					})
			: null,
	};
}
