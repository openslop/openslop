"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import isMatch from "lodash/isMatch";
import { useSlateStatic } from "slate-react";
import { resetTrim, setTrimPoint } from "@/lib/canvas/editor-ops";
import { usePointerDrag } from "@/lib/components/use-pointer-drag";
import {
	isTrimmable,
	isTrimmed,
	playedTrim,
	trimPointSec,
	type Trim,
	type TrimEdge,
} from "@/lib/render/clip-trim";
import { holdDuration } from "@/lib/render/sequences";
import { snapTrimEdge } from "@/lib/render/snap";
import type { TimelineClip } from "./timeline-rows";
import type { TrimSnap } from "./use-trim-snap";

const SNAP_PX = 8;

function useEdgeDrag(
	pxPerSec: number,
	onTrim: (deltaSec: number, snapping: boolean) => void,
	onEnd: () => void,
) {
	const originX = useRef(0);
	return usePointerDrag({
		onStart: (event) => {
			event.preventDefault();
			originX.current = event.clientX;
		},
		onMove: (event) =>
			onTrim((event.clientX - originX.current) / pxPerSec, !event.altKey),
		onEnd,
	});
}

/** A drag previews the moved edge and stores only that edge on release: one layout rebuild, one undo step. Alt holds the handle free of the snap targets. */
export function useClipTrim(
	clip: TimelineClip,
	pxPerSec: number,
	snap: TrimSnap,
) {
	const { element } = clip;
	const played = playedTrim(clip);
	const editor = useSlateStatic();
	const [preview, setPreview] = useState<Trim | null>(null);

	const trimBy = (edge: TrimEdge) => (deltaSec: number, snapping: boolean) => {
		const snapped = snapTrimEdge(
			clip,
			edge,
			deltaSec,
			snapping ? snap.targets(element.id) : [],
			SNAP_PX / pxPerSec,
		);
		setPreview(snapped.trim);
		snap.onSnap(snapped.snappedSec);
	};

	const hideGuide = useEffectEvent(() => snap.onSnap(null));
	useEffect(() => () => hideGuide(), []);

	const commit = (edge: TrimEdge) => () => {
		snap.onSnap(null);
		setPreview(null);
		if (!preview || isMatch(played, preview)) return;
		setTrimPoint(editor, element.id, edge, trimPointSec(preview, edge));
	};

	const handles = {
		start: {
			...useEdgeDrag(pxPerSec, trimBy("start"), commit("start")),
			onDoubleClick: () => resetTrim(editor, element.id, ["start"]),
		},
		end: {
			...useEdgeDrag(pxPerSec, trimBy("end"), commit("end")),
			onDoubleClick: () => resetTrim(editor, element.id, ["end"]),
		},
	};

	const trim = preview ?? played;

	return {
		trim,
		trimming: preview !== null,
		holdSec: holdDuration(clip, trim.trimDurationSec),
		handleProps: isTrimmable(element) ? handles : null,
		reset: isTrimmed(element) ? () => resetTrim(editor, element.id) : null,
	};
}
