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
	// `registerPlayer` is the mounted player's ref callback, so this state is the
	// only copy of the handle — nothing downstream mirrors it.
	const [player, setPlayer] = useState<PlayerRef | null>(null);
	const { showPlayer } = usePlayerPosition();
	// `showPlayer()` only schedules the mount, so a frame requested while the
	// player is hidden has nothing to run against until the ref arrives.
	const pendingFrameRef = useRef<number | null>(null);

	const registerPlayer = useCallback((next: PlayerRef | null) => {
		setPlayer(next);
		const frame = pendingFrameRef.current;
		pendingFrameRef.current = null;
		if (next && frame != null) startPlaybackAt(next, frame);
	}, []);

	const playFromFrame = useCallback(
		(frame: number) => {
			showPlayer();
			if (player) startPlaybackAt(player, frame);
			else pendingFrameRef.current = frame;
		},
		[showPlayer, player],
	);

	const value = useMemo(
		() => ({ player, registerPlayer, playFromFrame }),
		[player, registerPlayer, playFromFrame],
	);

	return <Ctx value={value}>{children}</Ctx>;
}
