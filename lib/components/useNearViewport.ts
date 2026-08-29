"use client";

import { useEffect, useRef, useState } from "react";

/** How far ahead of the viewport deferred work is worth starting. */
const ROOT_MARGIN = "300px";

/**
 * Latches true once the observed element first comes within {@link ROOT_MARGIN}
 * of the viewport, so a card can hold work back until it is about to be seen —
 * decoding an audio asset, say, which pulls the whole file down and expands it
 * to PCM. Latching rather than tracking: that work is one-shot, and scrolling
 * back past a card should not redo it.
 */
export function useNearViewport<T extends Element>() {
	const ref = useRef<T>(null);
	const [near, setNear] = useState(false);

	useEffect(() => {
		const element = ref.current;
		if (!element || near) return;
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries.some((entry) => entry.isIntersecting)) setNear(true);
			},
			{ rootMargin: ROOT_MARGIN },
		);
		observer.observe(element);
		return () => observer.disconnect();
	}, [near]);

	return { ref, near };
}
