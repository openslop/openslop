"use client";

import { useEffect, type RefObject } from "react";
import { usePlayerFrame } from "../use-player-state";
import { useLayout } from "../render-layout-context";

/** Keeps the playhead on screen once zooming makes the timeline scrollable. */
function useFollow(
	viewport: RefObject<HTMLDivElement | null>,
	x: number,
	leadingInset: number,
	viewportWidth: number,
	scrollable: boolean,
) {
	useEffect(() => {
		const element = viewport.current;
		if (!element || !scrollable) return;
		const left = element.scrollLeft;
		const contentX = x + leadingInset;
		if (contentX >= left + leadingInset && contentX <= left + viewportWidth)
			return;
		element.scrollTo({ left: Math.max(0, contentX - viewportWidth / 2) });
	}, [viewport, x, leadingInset, viewportWidth, scrollable]);
}

export function TimelinePlayhead({
	pxPerSec,
	viewport,
	viewportWidth,
	leadingInset,
	scrollable,
}: {
	pxPerSec: number;
	viewport: RefObject<HTMLDivElement | null>;
	viewportWidth: number;
	/** Width of the sticky gutter covering the scroller's leading edge. */
	leadingInset: number;
	scrollable: boolean;
}) {
	const { layout } = useLayout();
	const frame = usePlayerFrame();
	const x = (frame / layout.fps) * pxPerSec;
	useFollow(viewport, x, leadingInset, viewportWidth, scrollable);

	return (
		<div
			aria-hidden="true"
			className="pointer-events-none absolute inset-y-0 left-0 z-10 w-px bg-scrub-progress"
			style={{ transform: `translateX(${x}px)` }}
		>
			<svg
				viewBox="0 0 14 17"
				width="7"
				height="8.5"
				fill="currentColor"
				className="absolute top-0 left-1/2 -translate-x-1/2 text-scrub-progress"
			>
				<path d="M0 0h14v10l-6 7H6l-6-7z" />
			</svg>
		</div>
	);
}
