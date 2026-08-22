"use client";

import { findSegmentIndexAtFrame } from "@/lib/video/sceneSegments";
import { FRAME_EVENTS, usePlayerValue } from "./usePlayerState";
import { useLayout } from "./VideoLayoutContext";

/** The segment the playhead sits in, or -1 while there are none. */
export function useActiveSegmentIndex(): number {
	const { layout, segments } = useLayout();
	return usePlayerValue(
		FRAME_EVENTS,
		(p) => findSegmentIndexAtFrame(segments, p.getCurrentFrame(), layout.fps),
		-1,
	);
}
