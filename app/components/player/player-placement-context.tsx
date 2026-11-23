"use client";

import {
	useCallback,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from "react";
import { createRequiredContext } from "@/lib/components/create-required-context";

/** Where the player sits, or that it sits nowhere. */
export type PlayerPlacement = "top" | "right" | "hidden";

function getNarrowQuery(): string {
	if (typeof window === "undefined") return "";
	const token = getComputedStyle(document.documentElement)
		.getPropertyValue("--breakpoint-narrow")
		.trim();
	return token ? `(max-width: ${token})` : "";
}

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
		const query = getNarrowQuery();
		if (!query) return;
		const mediaQuery = window.matchMedia(query);
		const onChange = ({ matches }: MediaQueryListEvent | MediaQueryList) =>
			setNarrowViewport(matches);
		onChange(mediaQuery);
		mediaQuery.addEventListener("change", onChange);
		return () => mediaQuery.removeEventListener("change", onChange);
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
