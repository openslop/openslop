import type { PlayerRef } from "@remotion/player";
import { silenceMediaIn } from "./silenceMedia";

export type PlaybackTarget = Pick<
	PlayerRef,
	"pause" | "seekTo" | "play" | "getContainerNode"
>;

/**
 * The play has to land a whole frame after the seek. In the same tick the
 * Player parks its frame driver on the seek's buffering block while `play()`
 * starts the shared audio tags anyway, so audio runs against a frozen picture.
 * `pause()` keeps `seekTo` off its own pause-and-resume path, which also stalls.
 */
export function startPlaybackAt(player: PlaybackTarget, frame: number) {
	player.pause();
	player.seekTo(frame);
	silenceMediaIn(player.getContainerNode());
	requestAnimationFrame(() => player.play());
}
