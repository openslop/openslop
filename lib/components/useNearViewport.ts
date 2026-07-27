"use client";

import { useEffect, useState, type RefObject } from "react";

/** How far outside the scroll viewport a preview starts loading. */
const PRELOAD_MARGIN_PX = 400;

function scrollParentOf(node: Element): Element | null {
	for (let el = node.parentElement; el; el = el.parentElement) {
		const { overflowY } = getComputedStyle(el);
		if (overflowY === "auto" || overflowY === "scroll") return el;
	}
	return null;
}

/**
 * Latches true once `ref` scrolls within `PRELOAD_MARGIN_PX` of its nearest
 * scroll container, and stays true. Gates media previews that have no native
 * lazy loading, so an off-screen card costs nothing until it is nearly visible.
 */
export function useNearViewport(ref: RefObject<Element | null>): boolean {
	const [near, setNear] = useState(false);

	useEffect(() => {
		const node = ref.current;
		if (!node) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (!entry.isIntersecting) return;
				setNear(true);
				observer.disconnect();
			},
			{ root: scrollParentOf(node), rootMargin: `${PRELOAD_MARGIN_PX}px` },
		);
		observer.observe(node);
		return () => observer.disconnect();
	}, [ref]);

	return near;
}
