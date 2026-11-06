"use client";

import { useRef, useState } from "react";
import isMatch from "lodash/isMatch";
import round from "lodash/round";
import { useSlateStatic } from "slate-react";
import { findElementById, mergeAttrs } from "@/lib/canvas/editor-ops";
import { writeActiveResultTrim } from "@/lib/canvas/result-trims";
import { resultIdentity } from "@/lib/connectors/asset-url";
import { usePointerDrag } from "@/lib/components/use-pointer-drag";
import { useGenerationQueue } from "@/lib/generation/generation-queue-provider";
import {
	isTrimmable,
	isTrimmed,
	laidOut,
	previewSpan,
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
export function useClipTrim(clip: TimelineClip, pxPerSec: number) {
	const element = laidOut(clip);
	const editor = useSlateStatic();
	const queue = useGenerationQueue();
	const [preview, setPreview] = useState<Trim | null>(null);

	const trimBy = (edge: TrimEdge) => (deltaSec: number) =>
		setPreview(trimEdge(element, edge, deltaSec));

	const writeTrim = (
		trim: { trimStart: string; trimDuration: string } | null,
	) => {
		const result = queue.getElementSnapshot(element.id).result;
		if (!result) return;
		const found = findElementById(editor, element.id);
		if (!found) return;
		mergeAttrs(
			editor,
			element.id,
			writeActiveResultTrim(found[0], resultIdentity(result), trim),
		);
	};

	const commit = () => {
		setPreview(null);
		if (!preview || isMatch(element, preview)) return;
		writeTrim({
			trimStart: toAttr(preview.trimStartSec),
			trimDuration: toAttr(preview.trimDurationSec),
		});
	};

	const handles = {
		start: useEdgeDrag(pxPerSec, trimBy("start"), commit),
		end: useEdgeDrag(pxPerSec, trimBy("end"), commit),
	};

	const trim = preview ?? element;

	return {
		...previewSpan(element, clip, trim),
		trim,
		handleProps: isTrimmable(element) ? handles : null,
		reset: isTrimmed(clip.element) ? () => writeTrim(null) : null,
	};
}
