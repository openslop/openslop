"use client";

import { useLayoutEffect, useRef, useState, type RefObject } from "react";
import { clamp } from "@/lib/utils";

/** Multiples of fit-to-width; the timeline never zooms below the whole video. */
const ZOOM_LEVELS = [
	1, 1.25, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 48, 64,
];

type Anchor = { scrollLeft: number; anchorSec: number; fromPxPerSec: number };

/**
 * The scroll position that keeps the point `anchorSec` into the timeline at
 * the same place on screen when the scale changes, as far as the scroll
 * range allows.
 */
export function anchoredScrollLeft({
	scrollLeft,
	anchorSec,
	fromPxPerSec,
	toPxPerSec,
	maxScrollLeft,
}: Anchor & { toPxPerSec: number; maxScrollLeft: number }) {
	return clamp(
		scrollLeft + anchorSec * (toPxPerSec - fromPxPerSec),
		0,
		Math.max(0, maxScrollLeft),
	);
}

/** Every zoom step keeps the point at `anchorSec()`, the playhead, where it is on screen. */
export function useTimelineZoom(
	totalDurationSec: number,
	viewportWidth: number,
	viewport: RefObject<HTMLElement | null>,
	anchorSec: () => number,
) {
	const [level, setLevel] = useState(0);
	const anchor = useRef<Anchor | null>(null);
	const zoom = ZOOM_LEVELS[level];
	const fitPxPerSec =
		totalDurationSec > 0 ? viewportWidth / totalDurationSec : 0;
	const pxPerSec = fitPxPerSec * zoom;

	useLayoutEffect(() => {
		const element = viewport.current;
		const from = anchor.current;
		anchor.current = null;
		if (!element || !from) return;
		element.scrollTo({
			left: anchoredScrollLeft({
				...from,
				toPxPerSec: pxPerSec,
				maxScrollLeft: element.scrollWidth - element.clientWidth,
			}),
			behavior: "instant",
		});
	}, [pxPerSec, viewport]);

	const step = (to: number) => {
		const next = clamp(to, 0, ZOOM_LEVELS.length - 1);
		if (next === level) return;
		anchor.current = {
			scrollLeft: viewport.current?.scrollLeft ?? 0,
			anchorSec: anchorSec(),
			fromPxPerSec: pxPerSec,
		};
		setLevel(next);
	};

	return {
		zoom,
		pxPerSec,
		canZoomIn: level < ZOOM_LEVELS.length - 1,
		canZoomOut: level > 0,
		zoomIn: () => step(level + 1),
		zoomOut: () => step(level - 1),
	};
}
