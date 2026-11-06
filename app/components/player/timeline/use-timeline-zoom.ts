"use client";

import { useState } from "react";

/** Multiples of fit-to-width; the timeline never zooms below the whole video. */
export const ZOOM_LEVELS = [
	1, 1.25, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 48, 64,
];

export function useTimelineZoom(
	totalDurationSec: number,
	viewportWidth: number,
) {
	const [level, setLevel] = useState(0);
	const zoom = ZOOM_LEVELS[level];
	const fitPxPerSec =
		totalDurationSec > 0 ? viewportWidth / totalDurationSec : 0;

	return {
		zoom,
		pxPerSec: fitPxPerSec * zoom,
		canZoomIn: level < ZOOM_LEVELS.length - 1,
		canZoomOut: level > 0,
		zoomIn: () => setLevel((l) => Math.min(l + 1, ZOOM_LEVELS.length - 1)),
		zoomOut: () => setLevel((l) => Math.max(l - 1, 0)),
	};
}
