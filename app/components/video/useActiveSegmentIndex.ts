"use client";

import type { PlayerRef } from "@remotion/player";
import {
	findSegmentIndexAtFrame,
	type SceneSegment,
} from "@/lib/video/sceneSegments";
import { FRAME_EVENTS, usePlayerValue } from "./usePlayerState";

/** The segment the playhead sits in, or -1 while there are none. */
export function useActiveSegmentIndex(
	player: PlayerRef | null,
	segments: SceneSegment[],
	fps: number,
): number {
	return usePlayerValue(
		player,
		FRAME_EVENTS,
		(p) => findSegmentIndexAtFrame(segments, p.getCurrentFrame(), fps),
		-1,
	);
}
