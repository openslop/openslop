import type { PlayerRef } from "@remotion/player";

export type PlayQueue = {
	registerPlayer: (player: PlayerRef | null) => void;
	playFromFrame: (frame: number) => void;
};

/**
 * Defers play() until the lazy-loaded Remotion Player has registered itself.
 * Without this, a playFromFrame() fired before mount silently no-ops.
 */
export function createPlayQueue(showPlayer: () => void): PlayQueue {
	let player: PlayerRef | null = null;
	let pendingFrame: number | null = null;
	return {
		registerPlayer(p) {
			if (!p && pendingFrame != null) {
				console.warn(
					`[playQueue] dropping pending frame ${pendingFrame}: player unregistered before it could play`,
				);
				pendingFrame = null;
			}
			player = p;
			if (p && pendingFrame != null) {
				const frame = pendingFrame;
				pendingFrame = null;
				p.seekTo(frame);
				p.play();
			}
		},
		playFromFrame(frame) {
			showPlayer();
			if (player) {
				player.seekTo(frame);
				player.play();
			} else {
				pendingFrame = frame;
			}
		},
	};
}
