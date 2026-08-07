import type { PlayerRef } from "@remotion/player";
import { silenceMediaIn } from "./silenceMedia";

export type PlaybackTarget = Pick<
	PlayerRef,
	"pause" | "seekTo" | "play" | "getContainerNode"
>;

/**
 * Playing in the same tick as the seek freezes the picture (#425): the seek
 * makes the media elements buffer, the Player parks its frame driver while any
 * buffering block is held, and `play()` starts the shared audio tags directly,
 * so audio runs on against a still frame. One frame of separation lets the seek
 * commit first, which is what makes the scrub bar's play-on-pointerup work.
 *
 * `pause()` is load-bearing when the player is already playing: it stops
 * `seekTo` taking its own pause-and-resume path, which freezes the same way.
 */
export function startPlaybackAt(player: PlaybackTarget, frame: number) {
	player.pause();
	player.seekTo(frame);
	silenceMediaIn(player.getContainerNode());
	requestAnimationFrame(() => player.play());
}
