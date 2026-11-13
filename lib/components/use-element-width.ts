"use client";

import { useCallback, useRef, useState, type RefObject } from "react";

/**
 * Tracks an element's content-box width in whole px (0 until measured).
 *
 * A callback ref rather than an effect, so a node that mounts later is still
 * measured, and measured on attach: the observer only reports later resizes.
 */
export function useElementWidth<T extends HTMLElement>(): {
	ref: (element: T | null) => void;
	node: RefObject<T | null>;
	width: number;
} {
	const node = useRef<T | null>(null);
	const [width, setWidth] = useState(0);

	const ref = useCallback((element: T | null) => {
		node.current = element;
		if (!element) return;
		setWidth(Math.round(element.getBoundingClientRect().width));
		const observer = new ResizeObserver(([entry]) =>
			setWidth(Math.round(entry.contentRect.width)),
		);
		observer.observe(element);
		return () => {
			node.current = null;
			observer.disconnect();
		};
	}, []);

	return { ref, node, width };
}
