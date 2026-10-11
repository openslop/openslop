"use client";

import { useCallback, useRef, useState } from "react";
import { scrollableAncestor } from "./scroll-into-container";

const BOTTOM_SLACK_PX = 8;

const isAtBottom = ({
	scrollHeight,
	scrollTop,
	clientHeight,
}: Pick<Element, "scrollHeight" | "scrollTop" | "clientHeight">): boolean =>
	scrollHeight - scrollTop - clientHeight <= BOTTOM_SLACK_PX;

/** The chat rule: follow growth while the user is at the bottom of the scrollable ancestor, stop when they scroll up, resume at the bottom or on `follow`. */
export function useStickToBottom<T extends HTMLElement>(): {
	ref: (element: T | null) => void;
	stuck: boolean;
	follow: () => void;
} {
	const [stuck, setStuck] = useState(true);
	const held = useRef(true);
	const container = useRef<Element | null>(null);
	const lastTop = useRef(0);

	const hold = (value: boolean) => {
		held.current = value;
		setStuck(value);
	};

	const ref = useCallback((element: T | null) => {
		const scroller = element && scrollableAncestor(element);
		if (!element || !scroller) return;
		container.current = scroller;
		lastTop.current = scroller.scrollTop;

		const onScroll = () => {
			const up = scroller.scrollTop < lastTop.current;
			lastTop.current = scroller.scrollTop;
			if (isAtBottom(scroller)) hold(true);
			else if (up) hold(false);
		};
		const onResize = () => {
			if (held.current) scroller.scrollTop = scroller.scrollHeight;
		};

		scroller.addEventListener("scroll", onScroll);
		const observer = new ResizeObserver(onResize);
		observer.observe(element);
		observer.observe(scroller);
		return () => {
			scroller.removeEventListener("scroll", onScroll);
			observer.disconnect();
			container.current = null;
		};
	}, []);

	const follow = useCallback(() => {
		const scroller = container.current;
		if (!scroller) return;
		hold(true);
		scroller.scrollTo({ top: scroller.scrollHeight, behavior: "smooth" });
	}, []);

	return { ref, stuck, follow };
}
