"use client";

import {
	useRef,
	useState,
	useSyncExternalStore,
	type KeyboardEvent,
} from "react";
import { usePointerDrag } from "@/lib/components/use-pointer-drag";
import { clamp } from "@/lib/utils";

export type ResizeAxis = "vertical" | "horizontal";

const KEY_STEP = 16;

/**
 * `invert` is for a handle on the panel's leading edge — a bottom dock grabbed
 * from its top grows as the pointer moves up, the opposite of a top panel
 * grabbed from its bottom.
 */
export function clampResize(
	axis: ResizeAxis,
	pointerDelta: number,
	startSize: number,
	minSize: number,
	maxSize: number,
	invert = false,
): number {
	const towardsPointer = axis === "vertical" ? pointerDelta : -pointerDelta;
	const delta = invert ? -towardsPointer : towardsPointer;
	return clamp(startSize + delta, minSize, maxSize);
}

export function arrowPointerDelta(
	axis: ResizeAxis,
	key: string,
): number | null {
	const [back, forward] =
		axis === "vertical"
			? ["ArrowUp", "ArrowDown"]
			: ["ArrowLeft", "ArrowRight"];
	if (key === forward) return KEY_STEP;
	if (key === back) return -KEY_STEP;
	return null;
}

const subscribeToViewport = (onChange: () => void) => {
	window.addEventListener("resize", onChange);
	return () => window.removeEventListener("resize", onChange);
};

const unboundedOnServer = () => Infinity;

function useViewportLength(axis: ResizeAxis): number {
	return useSyncExternalStore(
		subscribeToViewport,
		() => (axis === "vertical" ? window.innerHeight : window.innerWidth),
		unboundedOnServer,
	);
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
	const [requested, setRequested] = useState(defaultSize);
	const [resizing, setResizing] = useState(false);
	const maxSize = useViewportLength(axis) * maxViewportFraction;
	const size = clamp(requested, minSize, maxSize);
	// Where the grab started, so a move is a delta rather than a running total.
	const origin = useRef({ pos: 0, size: defaultSize });

	const along = (event: { clientX: number; clientY: number }) =>
		axis === "vertical" ? event.clientY : event.clientX;

	const resizeBy = (startSize: number, pointerDelta: number) =>
		setRequested(
			clampResize(axis, pointerDelta, startSize, minSize, maxSize, invert),
		);

	const drag = usePointerDrag({
		onStart: (event) => {
			// Otherwise the browser starts a text selection under the pointer.
			event.preventDefault();
			origin.current = { pos: along(event), size };
			setResizing(true);
		},
		onMove: (event) =>
			resizeBy(origin.current.size, along(event) - origin.current.pos),
		onEnd: () => setResizing(false),
	});

	const handleProps = {
		...drag,
		"aria-valuemin": minSize,
		"aria-valuemax": Number.isFinite(maxSize) ? Math.round(maxSize) : undefined,
		"aria-valuenow": Math.round(size),
		onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
			const pointerDelta = arrowPointerDelta(axis, event.key);
			if (pointerDelta === null) return;
			event.preventDefault();
			resizeBy(size, pointerDelta);
		},
	};

	return { size, handleProps, resizing };
}
