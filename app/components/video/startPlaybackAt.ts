import type { PlayerRef } from "@remotion/player";
import type { SyntheticEvent } from "react";
import { silenceMediaIn } from "./silenceMedia";

export type PlaybackTarget = Pick<
	PlayerRef,
	"play" | "seekTo" | "getContainerNode"
>;

/**
 * Start playback at a frame by seeking while the player is already playing.
 *
 * The play cannot follow the seek in the same tick: Remotion parks its frame
 * driver while any media element holds a buffering block, but `play()` starts
 * the shared audio tags directly, so audio runs against a frozen picture
 * (#425). Seeking while playing hands that ordering to the Player, which
 * pauses, seeks, and replays from an effect once the new frame has committed.
 *
 * The originating click has to reach `play()`: Remotion only warms the shared
 * audio tag pool for autoplay when it is passed one.
 */
export function startPlaybackAt(
	player: PlaybackTarget | null,
	frame: number,
	event?: SyntheticEvent,
) {
	if (!player) return;
	player.play(event);
	player.seekTo(frame);
	silenceMediaIn(player.getContainerNode());
}
