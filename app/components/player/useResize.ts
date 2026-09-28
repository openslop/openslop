"use client";

import { useRef, useState } from "react";
import { usePointerDrag } from "@/lib/components/usePointerDrag";
import { clamp } from "@/lib/utils";

export type ResizeAxis = "vertical" | "horizontal";

/**
 * `invert` is for a handle on the panel's leading edge — a bottom dock grabbed
 * from its top grows as the pointer moves up, the opposite of a top panel
 * grabbed from its bottom.
 */
export function clampResize(
	axis: ResizeAxis,
	startPos: number,
	currentPos: number,
	startSize: number,
	minSize: number,
	maxSize: number,
	invert = false,
): number {
	const towardsPointer =
		axis === "vertical" ? currentPos - startPos : startPos - currentPos;
	const delta = invert ? -towardsPointer : towardsPointer;
	return clamp(startSize + delta, minSize, maxSize);
}

export function useResize({
	axis,
	defaultSize,
	minSize,
	maxViewportFraction,
	invert,
}: {
	axis: ResizeAxis;
	defaultSize: number;
	minSize: number;
	maxViewportFraction: number;
	invert?: boolean;
}) {
	const [size, setSize] = useState(defaultSize);
	const [resizing, setResizing] = useState(false);
	// Where the grab started, so a move is a delta rather than a running total.
	const origin = useRef({ pos: 0, size: defaultSize, maxSize: Infinity });

	const along = (event: { clientX: number; clientY: number }) =>
		axis === "vertical" ? event.clientY : event.clientX;

	const handleProps = usePointerDrag({
		onStart: (event) => {
			// Otherwise the browser starts a text selection under the pointer.
			event.preventDefault();
			const viewport =
				axis === "vertical" ? window.innerHeight : window.innerWidth;
			origin.current = {
				pos: along(event),
				size,
				maxSize: viewport * maxViewportFraction,
			};
			setResizing(true);
		},
		onMove: (event) =>
			setSize(
				clampResize(
					axis,
					origin.current.pos,
					along(event),
					origin.current.size,
					minSize,
					origin.current.maxSize,
					invert,
				),
			),
		onEnd: () => setResizing(false),
	});

	return { size, handleProps, resizing };
}
