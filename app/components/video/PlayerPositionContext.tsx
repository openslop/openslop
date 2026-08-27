"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { createRequiredContext } from "@/lib/components/createRequiredContext";

export type PlayerPosition = "top" | "right";

const NARROW_BREAKPOINT = 1066;
const NARROW_QUERY = `(max-width: ${NARROW_BREAKPOINT}px)`;

const [PlayerPositionContext, usePlayerPosition] = createRequiredContext<{
	position: PlayerPosition;
	visible: boolean;
	setPosition: (position: PlayerPosition) => void;
	setVisible: (visible: boolean) => void;
	showPlayer: () => void;
	narrowViewport: boolean;
}>("PlayerPositionContext");
export { usePlayerPosition };

export function PlayerPositionProvider({ children }: { children: ReactNode }) {
	const [position, setPosition] = useState<PlayerPosition>("right");
	const [visible, setVisible] = useState(true);
	const [narrowViewport, setNarrowViewport] = useState(false);

	const showPlayer = useCallback(() => setVisible(true), []);

	useEffect(() => {
		const mql = window.matchMedia(NARROW_QUERY);
		const onChange = (e: MediaQueryListEvent | MediaQueryList) => {
			setNarrowViewport(e.matches);
if (e.matches) {
  setPosition((prev) => (prev === "right" ? "left" : prev));
}
		};
		onChange(mql);
		mql.addEventListener("change", onChange);
		return () => mql.removeEventListener("change", onChange);
	}, []);

	return (
		<PlayerPositionContext
			value={{
				position,
				visible,
				setPosition,
				setVisible,
				showPlayer,
				narrowViewport,
			}}
		>
			{children}
		</PlayerPositionContext>
	);
}
