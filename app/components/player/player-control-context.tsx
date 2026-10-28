"use client";

import type { PlayerRef } from "@remotion/player";
import {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
	type ReactNode,
} from "react";
import { createRequiredContext } from "@/lib/components/create-required-context";
import { usePlayerPlacement } from "./player-placement-context";
import { startPlaybackAt } from "./start-playback-at";

type PlayerControl = {
	player: PlayerRef | null;
	registerPlayer: (player: PlayerRef | null) => void;
	playFromFrame: (frame: number) => void;
};

const [PlayerControlContext, usePlayerControl] =
	createRequiredContext<PlayerControl>("PlayerControlContext");
export { usePlayerControl };

export function PlayerControlProvider({ children }: { children: ReactNode }) {
	// `registerPlayer` is the mounted player's ref callback, so this state is the
	// only copy of the handle — nothing downstream mirrors it.
	const [player, registerPlayer] = useState<PlayerRef | null>(null);
	const { showPlayer } = usePlayerPlacement();
	// The preview remounts whenever the panel moves, hides or waits on the queue.
	const openAtFrameRef = useRef<number | null>(null);

	useEffect(() => {
		if (!player) return;
		const openAt = openAtFrameRef.current;
		if (openAt !== null) player.seekTo(openAt);
		return () => {
			openAtFrameRef.current = player.getCurrentFrame();
		};
	}, [player]);

	const playFromFrame = useCallback(
		(frame: number) => {
			if (player) startPlaybackAt(player, frame);
			else openAtFrameRef.current = frame;
			showPlayer();
		},
		[showPlayer, player],
	);

	const value = useMemo(
		() => ({ player, registerPlayer, playFromFrame }),
		[player, playFromFrame],
	);

	return <PlayerControlContext value={value}>{children}</PlayerControlContext>;
}
