"use client";

import type { PlayerRef } from "@remotion/player";
import { useCallback, useSyncExternalStore } from "react";
import { usePlayerControl } from "./PlayerControlContext";

type PlayerEvent =
	| "frameupdate"
	| "play"
	| "pause"
	| "volumechange"
	| "mutechange";

export const FRAME_EVENTS: readonly PlayerEvent[] = ["frameupdate"];
const PLAY_EVENTS: readonly PlayerEvent[] = ["play", "pause"];
const VOLUME_EVENTS: readonly PlayerEvent[] = ["volumechange"];
const MUTE_EVENTS: readonly PlayerEvent[] = ["mutechange"];

export function usePlayerValue<T>(
	events: readonly PlayerEvent[],
	read: (p: PlayerRef) => T,
	fallback: T,
): T {
	const { player } = usePlayerControl();
	const subscribe = useCallback(
		(notify: () => void) => {
			if (!player) return () => {};
			for (const event of events) player.addEventListener(event, notify);
			return () => {
				for (const event of events) player.removeEventListener(event, notify);
			};
		},
		[player, events],
	);
	return useSyncExternalStore(
		subscribe,
		() => (player ? read(player) : fallback),
		() => fallback,
	);
}

export function usePlayerFrame() {
	return usePlayerValue(FRAME_EVENTS, (p) => p.getCurrentFrame(), 0);
}

export function usePlayerPlaying() {
	return usePlayerValue(PLAY_EVENTS, (p) => p.isPlaying(), false);
}

export function usePlayerVolume() {
	return usePlayerValue(VOLUME_EVENTS, (p) => p.getVolume(), 1);
}

export function usePlayerMuted() {
	return usePlayerValue(MUTE_EVENTS, (p) => p.isMuted(), false);
}
