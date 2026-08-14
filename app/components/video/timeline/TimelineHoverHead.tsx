"use client";

import { useImperativeHandle, useRef, type Ref } from "react";
import { formatTime } from "@/lib/video/timestamps";
import { cn } from "@/lib/utils";
import { RULER_LABEL, RULER_LABEL_OFFSET } from "./TimelineRuler";

export type HoverHeadHandle = {
	show(seconds: number): void;
	hide(): void;
};

/**
 * The ghost playhead that tracks the pointer, with the hovered time beside it
 * in the ruler. Driven through a handle rather than state: a pointer move must
 * not re-render every clip.
 */
export function TimelineHoverHead({
	pxPerSec,
	ref,
}: {
	pxPerSec: number;
	ref?: Ref<HoverHeadHandle>;
}) {
	const lineRef = useRef<HTMLDivElement>(null);
	const labelRef = useRef<HTMLSpanElement>(null);

	useImperativeHandle(
		ref,
		() => ({
			show(seconds: number) {
				const line = lineRef.current;
				if (!line || !labelRef.current) return;
				line.style.transform = `translateX(${seconds * pxPerSec}px)`;
				line.style.opacity = "1";
				labelRef.current.textContent = formatTime(seconds);
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
			className="pointer-events-none absolute inset-y-0 left-0 z-10 w-px bg-scrub-hover opacity-0"
		>
			<span
				ref={labelRef}
				className={cn(
					"absolute left-1 rounded-xs bg-element-card px-1",
					RULER_LABEL,
					RULER_LABEL_OFFSET,
				)}
			/>
		</div>
	);
}
