import type { PlayerRef } from "@remotion/player";
import { silenceMediaIn } from "./silenceMedia";

export type PlaybackTarget = Pick<
	PlayerRef,
	"pause" | "seekTo" | "play" | "getContainerNode"
>;

export function startPlaybackAt(player: PlaybackTarget | null, frame: number) {
	// Pause before seeking, or the shared audio tags keep running on their own
	// media clock from the old position.
	player?.pause();
	player?.seekTo(frame);
	silenceMediaIn(player?.getContainerNode() ?? null);
	player?.play();
}
