"use client";

import type { PlayerRef } from "@remotion/player";
import { useCallback, useMemo, useState, type ReactNode } from "react";
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
	const [player, registerPlayer] = useState<PlayerRef | null>(null);
	const { showPlayer } = usePlayerPosition();

	const playFromFrame = useCallback(
		(frame: number) => {
			showPlayer();
			if (player) startPlaybackAt(player, frame);
		},
		[showPlayer, player],
	);

	const value = useMemo(
		() => ({ player, registerPlayer, playFromFrame }),
		[player, playFromFrame],
	);

	return <Ctx value={value}>{children}</Ctx>;
}
