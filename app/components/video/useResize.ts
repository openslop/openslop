"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { clamp } from "@/lib/utils";

export type ResizeAxis = "vertical" | "horizontal";

export function clampResize(
	axis: ResizeAxis,
	startPos: number,
	currentPos: number,
	startSize: number,
	minSize: number,
	maxSize: number,
): number {
	const delta =
		axis === "vertical" ? currentPos - startPos : startPos - currentPos;
	return clamp(startSize + delta, minSize, maxSize);
}

type ResizeListenerHost = {
	addEventListener: (type: string, listener: (ev: MouseEvent) => void) => void;
	removeEventListener: (
		type: string,
		listener: (ev: MouseEvent) => void,
	) => void;
};

export function attachResizeListeners(
	host: ResizeListenerHost,
	options: {
		axis: ResizeAxis;
		startPos: number;
		startSize: number;
		minSize: number;
		maxSize: number;
		onResize: (size: number) => void;
		onEnd: () => void;
	},
): () => void {
	const onMove = (ev: MouseEvent) => {
		const pos = options.axis === "vertical" ? ev.clientY : ev.clientX;
		options.onResize(
			clampResize(
				options.axis,
				options.startPos,
				pos,
				options.startSize,
				options.minSize,
				options.maxSize,
			),
		);
	};

	let cleaned = false;
	const cleanup = () => {
		if (cleaned) return;
		cleaned = true;
		host.removeEventListener("mousemove", onMove);
		host.removeEventListener("mouseup", onUp);
	};

	const onUp = () => {
		options.onEnd();
		cleanup();
	};

	host.addEventListener("mousemove", onMove);
	host.addEventListener("mouseup", onUp);
	return cleanup;
}

export function useResize({
	axis,
	defaultSize,
	minSize,
	maxSize,
}: {
	axis: ResizeAxis;
	defaultSize: number;
	minSize: number;
	maxSize: number;
}) {
	const [size, setSize] = useState(defaultSize);
	const [resizing, setResizing] = useState(false);
	const sizeRef = useRef(size);
	useEffect(() => {
		sizeRef.current = size;
	}, [size]);

	const cleanupRef = useRef<(() => void) | null>(null);

	useEffect(
		() => () => {
			cleanupRef.current?.();
			cleanupRef.current = null;
		},
		[],
	);

	const handleMouseDown = useCallback(
		(e: React.MouseEvent) => {
			e.preventDefault();
			cleanupRef.current?.();
			setResizing(true);
			cleanupRef.current = attachResizeListeners(document, {
				axis,
				startPos: axis === "vertical" ? e.clientY : e.clientX,
				startSize: sizeRef.current,
				minSize,
				maxSize,
				onResize: setSize,
				onEnd: () => setResizing(false),
			});
		},
		[axis, minSize, maxSize],
	);

	return { size, handleMouseDown, resizing };
}
