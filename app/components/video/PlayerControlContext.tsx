"use client";

import { createContext, use, useState, type ReactNode } from "react";
import { usePlayerPosition } from "./PlayerPositionContext";
import { createPlayQueue, type PlayQueue } from "./playQueue";

const Ctx = createContext<PlayQueue>({
	registerPlayer: () => {},
	playFromFrame: () => {},
});

export function PlayerControlProvider({ children }: { children: ReactNode }) {
	const { showPlayer } = usePlayerPosition();
	const [queue] = useState(() => createPlayQueue(showPlayer));
	return <Ctx value={queue}>{children}</Ctx>;
}

export function usePlayerControl() {
	return use(Ctx);
}
