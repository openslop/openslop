import type { PlayerRef } from "@remotion/player";
import { useCallback, useRef, useSyncExternalStore } from "react";

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
	player: PlayerRef | null,
	events: readonly PlayerEvent[],
	read: (p: PlayerRef) => T,
	fallback: T,
): T {
	// React calls getSnapshot on every render of every subscriber, plus a second
	// time after commit to check for tearing. `read` can be O(scenes), so hold
	// its result until either the player emits or the caller hands us a new
	// reader — a reader that closes over changing data must still see it.
	const cache = useRef<{
		player: PlayerRef;
		read: (p: PlayerRef) => T;
		value: T;
	} | null>(null);

	const subscribe = useCallback(
		(notify: () => void) => {
			if (!player) return () => {};
			const handler = () => {
				cache.current = null;
				notify();
			};
			for (const event of events) player.addEventListener(event, handler);
			return () => {
				cache.current = null;
				for (const event of events) player.removeEventListener(event, handler);
			};
		},
		[player, events],
	);

	const getSnapshot = () => {
		if (!player) return fallback;
		const cached = cache.current;
		if (cached && cached.player === player && cached.read === read) {
			return cached.value;
		}
		const value = read(player);
		cache.current = { player, read, value };
		return value;
	};

	return useSyncExternalStore(subscribe, getSnapshot, () => fallback);
}

// Module-level so the cache above survives re-renders of the subscriber: these
// read straight off the player and can only change when it emits.
const readFrame = (p: PlayerRef) => p.getCurrentFrame();
const readPlaying = (p: PlayerRef) => p.isPlaying();
const readVolume = (p: PlayerRef) => p.getVolume();
const readMuted = (p: PlayerRef) => p.isMuted();

export function usePlayerFrame(player: PlayerRef | null) {
	return usePlayerValue(player, FRAME_EVENTS, readFrame, 0);
}

export function usePlayerPlaying(player: PlayerRef | null) {
	return usePlayerValue(player, PLAY_EVENTS, readPlaying, false);
}

export function usePlayerVolume(player: PlayerRef | null) {
	return usePlayerValue(player, VOLUME_EVENTS, readVolume, 1);
}

export function usePlayerMuted(player: PlayerRef | null) {
	return usePlayerValue(player, MUTE_EVENTS, readMuted, false);
}
