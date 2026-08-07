"use client";

import type { PlayerRef } from "@remotion/player";
import {
	useCallback,
	useMemo,
	useRef,
	useState,
	type ReactNode,
	type SyntheticEvent,
} from "react";
import { createRequiredContext } from "@/lib/components/createRequiredContext";
import { usePlayerPosition } from "./PlayerPositionContext";
import { startPlaybackAt } from "./startPlaybackAt";

type PlaybackRequest = { frame: number; event?: SyntheticEvent };

type PlayerControl = {
	player: PlayerRef | null;
	registerPlayer: (player: PlayerRef | null) => void;
	playFromFrame: (frame: number, event?: SyntheticEvent) => void;
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
	// `showPlayer()` only schedules the mount, so a request made while the
	// player is hidden has nothing to run against until the ref arrives.
	const pendingRef = useRef<PlaybackRequest | null>(null);

	const registerPlayer = useCallback((next: PlayerRef | null) => {
		setPlayer(next);
		const pending = pendingRef.current;
		pendingRef.current = null;
		if (next && pending) startPlaybackAt(next, pending.frame, pending.event);
	}, []);

	const playFromFrame = useCallback(
		(frame: number, event?: SyntheticEvent) => {
			showPlayer();
			if (player) startPlaybackAt(player, frame, event);
			else pendingRef.current = { frame, event };
		},
		[showPlayer, player],
	);

	const value = useMemo(
		() => ({ player, registerPlayer, playFromFrame }),
		[player, registerPlayer, playFromFrame],
	);

	return <Ctx value={value}>{children}</Ctx>;
}
