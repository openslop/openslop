"use client";

import { useState, type RefObject } from "react";
import { flushSync } from "react-dom";

/** Multiples of fit-to-width; the timeline never zooms below the whole video. */
const ZOOM_LEVELS = [
	1, 1.25, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 48, 64,
];

export function useTimelineZoom(
	totalDurationSec: number,
	viewportWidth: number,
	viewport: RefObject<HTMLElement | null>,
	playheadSec: () => number,
) {
	const [level, setLevel] = useState(0);
	const fitPxPerSec =
		totalDurationSec > 0 ? viewportWidth / totalDurationSec : 0;
	const pxPerSecAt = (index: number) => fitPxPerSec * ZOOM_LEVELS[index];

	const zoomTo = (next: number) => {
		const element = viewport.current;
		const scrollLeft =
			(element?.scrollLeft ?? 0) +
			playheadSec() * (pxPerSecAt(next) - pxPerSecAt(level));
		flushSync(() => setLevel(next));
		element?.scrollTo({ left: scrollLeft });
	};

	return {
		zoom: ZOOM_LEVELS[level],
		pxPerSec: pxPerSecAt(level),
		canZoomIn: level < ZOOM_LEVELS.length - 1,
		canZoomOut: level > 0,
		zoomIn: () => zoomTo(level + 1),
		zoomOut: () => zoomTo(level - 1),
		zoomToFit: () => zoomTo(0),
	};
}
