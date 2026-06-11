"use client";

import type { PlayerRef } from "@remotion/player";
import { useCallback, useMemo, useRef, type ReactNode } from "react";
import { createRequiredContext } from "@/lib/components/createRequiredContext";
import { usePlayerPosition } from "./PlayerPositionContext";

type PlayerControl = {
	registerPlayer: (player: PlayerRef | null) => void;
	playFromFrame: (frame: number) => void;
};

const [Ctx, usePlayerControl] = createRequiredContext<PlayerControl>(
	"PlayerControlContext",
);
export { usePlayerControl };

export function PlayerControlProvider({ children }: { children: ReactNode }) {
	const playerRef = useRef<PlayerRef | null>(null);
	const { showPlayer } = usePlayerPosition();

	const registerPlayer = useCallback((p: PlayerRef | null) => {
		playerRef.current = p;
	}, []);

	const playFromFrame = useCallback(
		(frame: number) => {
			showPlayer();
			playerRef.current?.seekTo(frame);
			playerRef.current?.play();
		},
		[showPlayer],
	);

	const value = useMemo(
		() => ({ registerPlayer, playFromFrame }),
		[registerPlayer, playFromFrame],
	);

	return <Ctx value={value}>{children}</Ctx>;
}
