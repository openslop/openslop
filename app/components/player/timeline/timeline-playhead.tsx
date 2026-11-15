"use client";

import { useEffect } from "react";
import { usePlayerFrame } from "../use-player-state";
import { useLayout } from "../render-layout-context";
import { useTimelineZoomContext } from "./timeline-zoom-context";

export function TimelinePlayhead() {
	const { layout } = useLayout();
	const { viewport, viewportWidth, pxPerSec } = useTimelineZoomContext();
	const frame = usePlayerFrame();
	const x = (frame / layout.fps) * pxPerSec;

	useEffect(() => {
		const element = viewport.current;
		if (!element) return;
		const left = element.scrollLeft;
		if (x >= left && x <= left + viewportWidth) return;
		element.scrollTo({ left: Math.max(0, x - viewportWidth / 2) });
	}, [viewport, x, viewportWidth]);

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
