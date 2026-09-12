"use client";

import {
	useCallback,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from "react";
import { createRequiredContext } from "@/lib/components/createRequiredContext";

/** Where the player sits, or that it sits nowhere. */
export type PlayerPlacement = "top" | "right" | "hidden";

const NARROW_BREAKPOINT = 1066;
const NARROW_QUERY = `(max-width: ${NARROW_BREAKPOINT}px)`;

const [PlayerPlacementContext, usePlayerPlacement] = createRequiredContext<{
	placement: PlayerPlacement;
	setPlacement: (placement: PlayerPlacement) => void;
	showPlayer: () => void;
	narrowViewport: boolean;
}>("PlayerPlacementContext");
export { usePlayerPlacement };

export function PlayerPlacementProvider({ children }: { children: ReactNode }) {
	const [preferred, setPreferred] = useState<"top" | "right">("right");
	const [hidden, setHidden] = useState(false);
	const [narrowViewport, setNarrowViewport] = useState(false);

	useEffect(() => {
		const mql = window.matchMedia(NARROW_QUERY);
		const onChange = (e: MediaQueryListEvent | MediaQueryList) =>
			setNarrowViewport(e.matches);
		onChange(mql);
		mql.addEventListener("change", onChange);
		return () => mql.removeEventListener("change", onChange);
	}, []);

	/** Hiding keeps the preferred side, so showing the player again restores it. */
	const setPlacement = useCallback((next: PlayerPlacement) => {
		setHidden(next === "hidden");
		if (next !== "hidden") setPreferred(next);
	}, []);

	const showPlayer = useCallback(() => setHidden(false), []);

	const placement: PlayerPlacement = hidden
		? "hidden"
		: narrowViewport
			? "top"
			: preferred;

	const value = useMemo(
		() => ({ placement, setPlacement, showPlayer, narrowViewport }),
		[placement, setPlacement, showPlayer, narrowViewport],
	);

	return (
		<PlayerPlacementContext value={value}>{children}</PlayerPlacementContext>
	);
}
