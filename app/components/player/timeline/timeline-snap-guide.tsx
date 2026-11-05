"use client";

import { useImperativeHandle, useRef, type Ref } from "react";
import type { HoverHeadHandle } from "./timeline-hover-head";

/** Marks the edge a dragged trim handle is held on. A handle, like the hover head: a pointer move must not re-render every clip. */
export function TimelineSnapGuide({
	pxPerSec,
	ref,
}: {
	pxPerSec: number;
	ref?: Ref<HoverHeadHandle>;
}) {
	const lineRef = useRef<HTMLDivElement>(null);

	useImperativeHandle(
		ref,
		() => ({
			show(seconds: number) {
				const line = lineRef.current;
				if (!line) return;
				line.style.transform = `translateX(${seconds * pxPerSec}px)`;
				line.style.opacity = "1";
			},
			hide() {
				if (lineRef.current) lineRef.current.style.opacity = "0";
			},
		}),
		[pxPerSec],
	);

	return (
		<div
			ref={lineRef}
			aria-hidden="true"
			className="pointer-events-none absolute inset-y-0 left-0 z-10 w-px bg-foreground opacity-0"
		/>
	);
}
