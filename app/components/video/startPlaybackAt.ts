import type { PlayerRef } from "@remotion/player";
import type { SyntheticEvent } from "react";
import { silenceMediaIn } from "./silenceMedia";

export type PlaybackTarget = Pick<
	PlayerRef,
	"play" | "seekTo" | "getContainerNode"
>;

/**
 * Seeking mid-playback is what defers the resume: the Player pauses, seeks, and
 * replays from an effect once the new frame has committed. Playing after the
 * seek instead runs the shared audio tags against a frame driver still parked
 * on the seek's buffering block (#425).
 *
 * `play()` needs the originating event: Remotion only warms the shared audio
 * tags for autoplay when it gets one.
 */
export function startPlaybackAt(
	player: PlaybackTarget,
	frame: number,
	event?: SyntheticEvent,
) {
	player.play(event);
	player.seekTo(frame);
	silenceMediaIn(player.getContainerNode());
}
