"use client";

import type { PlayerRef } from "@remotion/player";
import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { createRequiredContext } from "@/lib/components/createRequiredContext";
import { usePlayerPosition } from "./PlayerPositionContext";
import { startPlaybackAt } from "./startPlaybackAt";

type PlayerControl = {
	player: PlayerRef | null;
	registerPlayer: (player: PlayerRef | null) => void;
	playFromFrame: (frame: number) => void;
};

const [Ctx, usePlayerControl] = createRequiredContext<PlayerControl>(
	"PlayerControlContext",
);
export { usePlayerControl };

export function PlayerControlProvider({ children }: { children: ReactNode }) {
	const playerRef = useRef<PlayerRef | null>(null);
	const [player, setPlayer] = useState<PlayerRef | null>(null);
	const { showPlayer } = usePlayerPosition();

	const registerPlayer = useCallback((p: PlayerRef | null) => {
		playerRef.current = p;
		setPlayer(p);
	}, []);

	const playFromFrame = useCallback(
		(frame: number) => {
			showPlayer();
			startPlaybackAt(playerRef.current, frame);
		},
		[showPlayer],
	);

	const value = useMemo(
		() => ({ player, registerPlayer, playFromFrame }),
		[player, registerPlayer, playFromFrame],
	);

	return <Ctx value={value}>{children}</Ctx>;
}
