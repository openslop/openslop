"use client";

import { useState } from "react";

/** Multiples of fit-to-width; the timeline never zooms below the whole video. */
const ZOOM_LEVELS = [1, 1.5, 2, 3, 4, 6, 8];

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
