"use client";

import { useState, type RefObject } from "react";
import { flushSync } from "react-dom";

/** Percents of fit-to-width the zoom buttons stop at; never below the whole video. */
const ZOOM_STOPS = [
	100, 125, 150, 200, 250, 300, 400, 500, 600, 800, 1000, 1200, 1600, 2000,
	2400, 3200, 4800, 6400,
];

export const ZOOM_RANGE = {
	min: ZOOM_STOPS[0],
	max: ZOOM_STOPS[ZOOM_STOPS.length - 1],
	step: 25,
};

export function useTimelineZoom(
	totalDurationSec: number,
	viewportWidth: number,
	viewport: RefObject<HTMLElement | null>,
	playheadSec: () => number,
) {
	const [zoom, setZoomState] = useState(ZOOM_RANGE.min);
	const fitPxPerSec =
		totalDurationSec > 0 ? viewportWidth / totalDurationSec : 0;
	const pxPerSecAt = (percent: number) => (fitPxPerSec * percent) / 100;

	const setZoom = (next: number) => {
		const element = viewport.current;
		const scrollLeft =
			(element?.scrollLeft ?? 0) +
			playheadSec() * (pxPerSecAt(next) - pxPerSecAt(zoom));
		flushSync(() => setZoomState(next));
		element?.scrollTo({ left: scrollLeft });
	};

	return {
		zoom,
		pxPerSec: pxPerSecAt(zoom),
		setZoom,
		canZoomIn: zoom < ZOOM_RANGE.max,
		canZoomOut: zoom > ZOOM_RANGE.min,
		zoomIn: () => setZoom(ZOOM_STOPS.find((stop) => stop > zoom) ?? zoom),
		zoomOut: () => setZoom(ZOOM_STOPS.findLast((stop) => stop < zoom) ?? zoom),
	};
}
