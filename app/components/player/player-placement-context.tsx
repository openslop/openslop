"use client";

import {
	useCallback,
	useMemo,
	useState,
	useSyncExternalStore,
	type ReactNode,
} from "react";
import { createRequiredContext } from "@/lib/components/create-required-context";

/** Where the player sits, or that it sits nowhere. */
export type PlayerPlacement = "top" | "right" | "hidden";

// Tailwind's max-lg; JS can't read the theme's breakpoints.
const NARROW_QUERY = "(width < 64rem)";

function subscribeNarrow(onChange: () => void) {
	const mediaQuery = window.matchMedia(NARROW_QUERY);
	mediaQuery.addEventListener("change", onChange);
	return () => mediaQuery.removeEventListener("change", onChange);
}

const isNarrow = () => window.matchMedia(NARROW_QUERY).matches;

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
	const narrowViewport = useSyncExternalStore(
		subscribeNarrow,
		isNarrow,
		() => false,
	);

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
