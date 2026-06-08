import type { PlayerRef } from "@remotion/player";
import { useSyncExternalStore } from "react";

type PlayerEvent =
	| "frameupdate"
	| "play"
	| "pause"
	| "volumechange"
	| "mutechange";

export function usePlayerValue<T>(
	player: PlayerRef | null,
	events: PlayerEvent[],
	read: (p: PlayerRef) => T,
	fallback: T,
): T {
	return useSyncExternalStore(
		(notify) => {
			if (!player) return () => {};
			for (const event of events) player.addEventListener(event, notify);
			return () => {
				for (const event of events) player.removeEventListener(event, notify);
			};
		},
		() => (player ? read(player) : fallback),
		() => fallback,
	);
}

export function usePlayerFrame(player: PlayerRef | null) {
	return usePlayerValue(player, ["frameupdate"], (p) => p.getCurrentFrame(), 0);
}

export function usePlayerPlaying(player: PlayerRef | null) {
	return usePlayerValue(player, ["play", "pause"], (p) => p.isPlaying(), false);
}

export function usePlayerVolume(player: PlayerRef | null) {
	return usePlayerValue(player, ["volumechange"], (p) => p.getVolume(), 1);
}

export function usePlayerMuted(player: PlayerRef | null) {
	return usePlayerValue(player, ["mutechange"], (p) => p.isMuted(), false);
}
