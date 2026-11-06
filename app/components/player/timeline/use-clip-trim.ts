"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import isMatch from "lodash/isMatch";
import round from "lodash/round";
import { useSlateStatic } from "slate-react";
import { mergeAttrs, resetTrim } from "@/lib/canvas/editor-ops";
import { usePointerDrag } from "@/lib/components/use-pointer-drag";
import {
	isTrimmable,
	isTrimmed,
	extensionSec,
	laidOut,
	trimEdge,
	type Trim,
	type TrimEdge,
} from "@/lib/render/clip-trim";
import { snapTrimEdge } from "@/lib/render/snap";
import type { TimelineClip } from "./timeline-rows";
import type { TrimSnap } from "./use-trim-snap";

// The layout snaps whatever is stored onto the frame grid.
const toAttr = (sec: number) => String(round(sec, 2));

const SNAP_PX = 8;

function useEdgeDrag(
	pxPerSec: number,
	onTrim: (deltaSec: number, snapping: boolean) => void,
	onEnd: () => void,
	onDoubleClick: () => void,
) {
	const originX = useRef(0);
	const drag = usePointerDrag({
		onStart: (event) => {
			event.preventDefault();
			originX.current = event.clientX;
		},
		onMove: (event) =>
			onTrim((event.clientX - originX.current) / pxPerSec, !event.altKey),
		onEnd,
	});
	return { ...drag, onDoubleClick };
}

/** A drag previews the new length and commits it on release: one layout rebuild, one undo step. Alt holds the handle free of the snap targets. */
export function useClipTrim(
	clip: TimelineClip,
	pxPerSec: number,
	snap: TrimSnap,
) {
	const element = laidOut(clip);
	const editor = useSlateStatic();
	const [preview, setPreview] = useState<Trim | null>(null);

	const trimBy = (edge: TrimEdge) => (deltaSec: number, snapping: boolean) => {
		const snapped = snapTrimEdge(
			{ element, start: clip.start },
			edge,
			deltaSec,
			snapping ? snap.targets(element.id) : [],
			SNAP_PX / pxPerSec,
		);
		setPreview(snapped.trim);
		snap.onSnap(snapped.snappedSec);
	};

	const hideGuide = useEffectEvent(() => snap.onSnap(null));
	const previewing = preview !== null;
	// A layout rebuilt mid-drag can remount the clip, ending the drag without a release.
	useEffect(() => (previewing ? () => hideGuide() : undefined), [previewing]);

	const save = (next: Trim | null) => {
		setPreview(null);
		if (!next || isMatch(element, next)) return;
		mergeAttrs(editor, element.id, {
			trimStart: toAttr(next.trimStartSec),
			trimDuration: toAttr(next.trimDurationSec),
		});
	};

	const commit = () => save(preview);
	const untrimStart = () => {
		const next = trimEdge(element, "start", -Infinity);
		if (isTrimmed({ ...element, ...next })) save(next);
		else resetTrim(editor, element.id);
	};
	const untrimEnd = () =>
		element.trimStartSec > 0
			? resetTrim(editor, element.id, ["trimDuration"])
			: resetTrim(editor, element.id);

	const handles = {
		start: useEdgeDrag(pxPerSec, trimBy("start"), commit, untrimStart),
		end: useEdgeDrag(pxPerSec, trimBy("end"), commit, untrimEnd),
	};

	const trim = preview ?? element;

	return {
		trim,
		extensionSec: extensionSec(clip, trim),
		handleProps: isTrimmable(element) ? handles : null,
		reset: isTrimmed(clip.element) ? () => resetTrim(editor, element.id) : null,
	};
}
