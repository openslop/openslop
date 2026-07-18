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
	// Set when "play from here" fires before the player panel has mounted; the
	// frame is replayed as soon as the player registers.
	const pendingFrameRef = useRef<number | null>(null);
	const { showPlayer } = usePlayerPosition();

	const registerPlayer = useCallback((p: PlayerRef | null) => {
		playerRef.current = p;
		setPlayer(p);

		const pendingFrame = pendingFrameRef.current;
		if (p && pendingFrame !== null) {
			pendingFrameRef.current = null;
			startPlaybackAt(p, pendingFrame);
		}
	}, []);

	const playFromFrame = useCallback(
		(frame: number) => {
			showPlayer();

			const p = playerRef.current;
			if (!p) {
				// showPlayer() only schedules the state update, so the panel holding
				// the player has not mounted yet. Seeking now would no-op and the
				// player would come up paused.
				pendingFrameRef.current = frame;
				return;
			}

			startPlaybackAt(p, frame);
		},
		[showPlayer],
	);

	const value = useMemo(
		() => ({ player, registerPlayer, playFromFrame }),
		[player, registerPlayer, playFromFrame],
	);

	return <Ctx value={value}>{children}</Ctx>;
}
