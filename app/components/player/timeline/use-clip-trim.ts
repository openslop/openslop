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
	{ element, duration, dialogueSec = 0 }: TimelineClip,
	pxPerSec: number,
) {
	const editor = useSlateStatic();
	const [preview, setPreview] = useState<Trim | null>(null);
	const resting = trimEdge(element, "end", 0, dialogueSec);

	const trimBy = (edge: TrimEdge) => (deltaSec: number) =>
		setPreview(trimEdge(element, edge, deltaSec, dialogueSec));

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

	return {
		// The drawn span can differ from the clip's own length (dialogue, cross-fades), so preview the change.
		durationSec:
			duration + (preview ? preview.durationSec - resting.durationSec : 0),
		trim: preview ?? resting,
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
