"use client";

import { findSegmentIndexAtFrame } from "@/lib/render/scene-segments";
import { FRAME_EVENTS, usePlayerValue } from "./use-player-state";
import { useLayout } from "./render-layout-context";

/** The segment the playhead sits in, or -1 while there are none. */
export function useActiveSegmentIndex(): number {
	const { layout, segments } = useLayout();
	return usePlayerValue(
		FRAME_EVENTS,
		(p) => findSegmentIndexAtFrame(segments, p.getCurrentFrame(), layout.fps),
		-1,
	);
}
