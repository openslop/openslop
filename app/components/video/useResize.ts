"use client";

import {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
	type CSSProperties,
} from "react";
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

const SIZE_PROPERTY = { vertical: "height", horizontal: "width" } as const;

/**
 * Drags write the panel dimension straight to the DOM node. Holding it in React
 * state would re-render the panel — and everything it wraps — on every
 * mousemove, which for the player panel means the whole Remotion composition.
 */
export function useResize({
	axis,
	defaultSize,
	minSize,
	maxViewportFraction,
}: {
	axis: ResizeAxis;
	defaultSize: number;
	minSize: number;
	maxViewportFraction: number;
}) {
	const panelRef = useRef<HTMLDivElement>(null);
	const [resizing, setResizing] = useState(false);
	const cleanupRef = useRef<(() => void) | null>(null);
	const property = SIZE_PROPERTY[axis];

	useEffect(
		() => () => {
			cleanupRef.current?.();
			cleanupRef.current = null;
		},
		[],
	);

	const handleMouseDown = useCallback(
		(e: React.MouseEvent) => {
			const panel = panelRef.current;
			if (!panel) throw new Error("Resize started before the panel mounted");
			e.preventDefault();
			cleanupRef.current?.();
			setResizing(true);
			const vertical = axis === "vertical";
			const viewport = vertical ? window.innerHeight : window.innerWidth;
			const rect = panel.getBoundingClientRect();
			cleanupRef.current = attachResizeListeners(document, {
				axis,
				startPos: vertical ? e.clientY : e.clientX,
				startSize: vertical ? rect.height : rect.width,
				minSize,
				maxSize: viewport * maxViewportFraction,
				onResize: (size) => {
					panel.style[property] = `${size}px`;
				},
				onEnd: () => setResizing(false),
			});
		},
		[axis, minSize, maxViewportFraction, property],
	);

	const style = useMemo<CSSProperties>(
		() => ({ [property]: defaultSize }),
		[property, defaultSize],
	);

	return { panelRef, style, handleMouseDown, resizing };
}
