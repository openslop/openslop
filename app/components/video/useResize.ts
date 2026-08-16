"use client";

import {
	useCallback,
	useEffect,
	useRef,
	useState,
	type CSSProperties,
} from "react";
import { clamp } from "@/lib/utils";

export type ResizeAxis = "vertical" | "horizontal";

/**
 * The dragged size reaches the DOM as a custom property on the panel, so a drag
 * writes one property instead of re-rendering the panel's subtree per mousemove.
 * Nothing renders the variable, so an unrelated render can't clobber the drag.
 */
const SIZE_VAR = "--panel-size";

export function panelSizeStyle(
	axis: ResizeAxis,
	defaultSize: number,
): CSSProperties {
	const size = `var(${SIZE_VAR}, ${defaultSize}px)`;
	return axis === "vertical" ? { height: size } : { width: size };
}

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
		invert?: boolean;
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
				options.invert,
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
	maxViewportFraction,
	invert,
}: {
	axis: ResizeAxis;
	defaultSize: number;
	minSize: number;
	maxViewportFraction: number;
	invert?: boolean;
}) {
	const [resizing, setResizing] = useState(false);
	const panelRef = useRef<HTMLDivElement>(null);
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
			const panel = panelRef.current;
			if (!panel)
				throw new Error("Resize handle fired before its panel mounted");
			e.preventDefault();
			cleanupRef.current?.();
			setResizing(true);
			const vertical = axis === "vertical";
			const rect = panel.getBoundingClientRect();
			cleanupRef.current = attachResizeListeners(document, {
				axis,
				startPos: vertical ? e.clientY : e.clientX,
				startSize: vertical ? rect.height : rect.width,
				minSize,
				maxSize:
					(vertical ? window.innerHeight : window.innerWidth) *
					maxViewportFraction,
				invert,
				onResize: (size) => panel.style.setProperty(SIZE_VAR, `${size}px`),
				onEnd: () => setResizing(false),
			});
		},
		[axis, minSize, maxViewportFraction, invert],
	);

	return {
		panelRef,
		style: panelSizeStyle(axis, defaultSize),
		handleMouseDown,
		resizing,
	};
}
