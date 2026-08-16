"use client";

import { useState } from "react";

/** Multiples of fit-to-width; the timeline never zooms below the whole video. */
const ZOOM_LEVELS = [1, 1.5, 2, 3, 4, 6, 8];

/**
 * Pixels per second at 1x: the whole video across the viewport. A viewport not
 * yet measured (or narrower than the chrome subtracted from it) has no scale —
 * a negative one would lay every clip, tick and playhead out backwards.
 */
export function fitPxPerSec(
	totalDurationSec: number,
	viewportWidth: number,
): number {
	if (totalDurationSec <= 0 || viewportWidth <= 0) return 0;
	return viewportWidth / totalDurationSec;
}

export function useTimelineZoom(
	totalDurationSec: number,
	viewportWidth: number,
) {
	const [level, setLevel] = useState(0);
	const zoom = ZOOM_LEVELS[level];

	return {
		zoom,
		pxPerSec: fitPxPerSec(totalDurationSec, viewportWidth) * zoom,
		canZoomIn: level < ZOOM_LEVELS.length - 1,
		canZoomOut: level > 0,
		zoomIn: () => setLevel((l) => Math.min(l + 1, ZOOM_LEVELS.length - 1)),
		zoomOut: () => setLevel((l) => Math.max(l - 1, 0)),
	};
}
