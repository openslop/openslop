import type { PlayerRef } from "@remotion/player";
import { useCallback, useSyncExternalStore } from "react";

type PlayerEvent =
	| "frameupdate"
	| "play"
	| "pause"
	| "volumechange"
	| "mutechange";

export const PLAYER_FRAME_EVENTS: readonly PlayerEvent[] = ["frameupdate"];
const PLAY_PAUSE: readonly PlayerEvent[] = ["play", "pause"];
const VOLUMECHANGE: readonly PlayerEvent[] = ["volumechange"];
const MUTECHANGE: readonly PlayerEvent[] = ["mutechange"];

export function usePlayerValue<T>(
	player: PlayerRef | null,
	events: readonly PlayerEvent[],
	read: (p: PlayerRef) => T,
	fallback: T,
): T {
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

export function usePlayerFrame(player: PlayerRef | null) {
	return usePlayerValue(player, PLAYER_FRAME_EVENTS, readFrame, 0);
}

export function usePlayerPlaying(player: PlayerRef | null) {
	return usePlayerValue(player, PLAY_PAUSE, readPlaying, false);
}

export function usePlayerVolume(player: PlayerRef | null) {
	return usePlayerValue(player, VOLUMECHANGE, readVolume, 1);
}

export function usePlayerMuted(player: PlayerRef | null) {
	return usePlayerValue(player, MUTECHANGE, readMuted, false);
}

const readFrame = (p: PlayerRef) => p.getCurrentFrame();
const readPlaying = (p: PlayerRef) => p.isPlaying();
const readVolume = (p: PlayerRef) => p.getVolume();
const readMuted = (p: PlayerRef) => p.isMuted();
