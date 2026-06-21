import type { MutableRefObject } from "react";

type FrameReader = {
	getCurrentFrame: () => number;
};

type FrameSeeker = {
	seekTo: (frame: number) => void;
};

export function clampRestoredFrame(frame: number, totalFrames: number) {
	return Math.max(0, Math.min(frame, Math.max(0, totalFrames - 1)));
}

export function rememberPlayerFrame(
	player: FrameReader,
	frameRef: MutableRefObject<number | null>,
) {
	frameRef.current = player.getCurrentFrame();
}

export function restorePlayerFrame(
	player: FrameSeeker,
	frameRef: MutableRefObject<number | null>,
	totalFrames: number,
) {
	const frame = frameRef.current;
	if (frame === null) return;
	player.seekTo(clampRestoredFrame(frame, totalFrames));
}
