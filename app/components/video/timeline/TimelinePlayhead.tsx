"use client";

import { useEffect, type RefObject } from "react";
import type { PlayerRef } from "@remotion/player";
import { usePlayerFrame } from "../usePlayerState";

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
	player,
	fps,
	pxPerSec,
	viewport,
	viewportWidth,
	leadingInset,
	scrollable,
}: {
	player: PlayerRef | null;
	fps: number;
	pxPerSec: number;
	viewport: RefObject<HTMLDivElement | null>;
	viewportWidth: number;
	/** Width of the sticky gutter covering the scroller's leading edge. */
	leadingInset: number;
	scrollable: boolean;
}) {
	const frame = usePlayerFrame(player);
	const x = (frame / fps) * pxPerSec;
	useFollow(viewport, x, leadingInset, viewportWidth, scrollable);

	return (
		<div
			aria-hidden="true"
			className="pointer-events-none absolute inset-y-0 left-0 z-10 w-px bg-scrub-progress"
			style={{ transform: `translateX(${x}px)` }}
		>
			<svg
				viewBox="0 0 9 12"
				width="9"
				height="12"
				fill="currentColor"
				className="absolute -left-1 top-0 text-scrub-progress"
			>
				<path d="M8 1v5L4.5 10 1 6V1h7z" fillRule="nonzero" />
			</svg>
		</div>
	);
}
