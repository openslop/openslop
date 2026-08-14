"use client";

import { useMemo, useRef } from "react";
import type { PlayerRef } from "@remotion/player";
import { silenceMediaIn } from "./silenceMedia";

/**
 * Seeking while scrubbing. The composition's media tags run on their own clock,
 * so a seek mid-playback leaks audio from the old position unless they are
 * silenced. Shared by every scrub surface.
 */
export function usePlayerScrub(player: PlayerRef | null) {
	const wasPlaying = useRef(false);

	return useMemo(
		() => ({
			start() {
				if (!player) return;
				wasPlaying.current = player.isPlaying();
				if (!wasPlaying.current) return;
				player.pause();
				silenceMediaIn(player.getContainerNode());
			},
			seekTo(frame: number) {
				if (!player) return;
				player.seekTo(frame);
				if (wasPlaying.current) silenceMediaIn(player.getContainerNode());
			},
			end() {
				if (wasPlaying.current) player?.play();
				wasPlaying.current = false;
			},
		}),
		[player],
	);
}
