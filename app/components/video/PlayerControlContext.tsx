"use client";

import { createContext, use, useMemo, type ReactNode } from "react";
import { usePlayerPosition } from "./PlayerPositionContext";
import { createPlayQueue, type PlayQueue } from "./playQueue";

const Ctx = createContext<PlayQueue>({
	registerPlayer: () => {},
	playFromFrame: () => {},
});

export function PlayerControlProvider({ children }: { children: ReactNode }) {
	const { showPlayer } = usePlayerPosition();
	const value = useMemo(() => createPlayQueue(showPlayer), [showPlayer]);
	return <Ctx value={value}>{children}</Ctx>;
}

export function usePlayerControl() {
	return use(Ctx);
}
