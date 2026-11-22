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

/** The panel edge its handle sits on; top and left are the start. */
type HandleEdge = "start" | "end";

const KEY_STEP = 16;

export function clampResize(
	handleEdge: HandleEdge,
	pointerDelta: number,
	startSize: number,
	minSize: number,
	maxSize: number,
): number {
	const delta = handleEdge === "end" ? pointerDelta : -pointerDelta;
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
	maxSize: maxLength = Infinity,
	maxViewportFraction = 1,
	handleEdge,
}: {
	axis: ResizeAxis;
	defaultSize: number;
	minSize: number;
	maxSize?: number;
	maxViewportFraction?: number;
	handleEdge: HandleEdge;
}) {
	const [requested, setRequested] = useState(defaultSize);
	const [resizing, setResizing] = useState(false);
	const maxSize = Math.min(
		maxLength,
		useViewportLength(axis) * maxViewportFraction,
	);
	const size = clamp(requested, minSize, maxSize);
	// Where the grab started, so a move is a delta rather than a running total.
	const origin = useRef({ position: 0, size: defaultSize });

	const along = (event: { clientX: number; clientY: number }) =>
		axis === "vertical" ? event.clientY : event.clientX;

	const resizeBy = (startSize: number, pointerDelta: number) =>
		setRequested(
			clampResize(handleEdge, pointerDelta, startSize, minSize, maxSize),
		);

	const drag = usePointerDrag({
		onStart: (event) => {
			// Otherwise the browser starts a text selection under the pointer.
			event.preventDefault();
			origin.current = { position: along(event), size };
			setResizing(true);
		},
		onMove: (event) =>
			resizeBy(origin.current.size, along(event) - origin.current.position),
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
