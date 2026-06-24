import type { PlayerRef } from "@remotion/player";
import { useEffect, type MutableRefObject } from "react";
import { clamp } from "@/lib/utils";

// Carries the playhead across the player's `key` remount via a parent-owned ref.
export function usePreservedPlayhead(
	player: PlayerRef | null,
	frameRef: MutableRefObject<number | null>,
	totalFrames: number,
) {
	useEffect(() => {
		if (!player) return;
		const remembered = frameRef.current;
		if (remembered !== null) {
			player.seekTo(clamp(remembered, 0, Math.max(0, totalFrames - 1)));
		}
		return () => {
			frameRef.current = player.getCurrentFrame();
		};
	}, [player, frameRef, totalFrames]);
}
