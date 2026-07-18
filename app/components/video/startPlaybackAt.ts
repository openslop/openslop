import type { PlayerRef } from "@remotion/player";
import { silenceMediaIn } from "./silenceMedia";

/** The slice of PlayerRef needed to start playback, so the sequence stays testable. */
export type PlaybackTarget = Pick<
	PlayerRef,
	"pause" | "seekTo" | "play" | "getContainerNode"
>;

/**
 * Start playback at `frame`, in the order the scrub bar already uses.
 *
 * Seeking while the frame driver is running lets the shared audio tags start on
 * their own media clock from the old position, which leaves audio playing
 * against a frozen driver. Pausing first, then seeking, then silencing any tag
 * that slipped through, means play() starts everything from the target frame.
 */
export function startPlaybackAt(player: PlaybackTarget, frame: number) {
	player.pause();
	player.seekTo(frame);
	silenceMediaIn(player.getContainerNode());
	player.play();
}
