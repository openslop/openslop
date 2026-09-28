/**
 * Seconds are the input unit (provider durations, caption timestamps); frames
 * are the timeline unit. Remotion rounds when it converts, so every crossing
 * has to round the same way — otherwise layers positioned absolutely drift
 * away from the ones the renderer positions for us.
 */

export function toFrames(sec: number, fps: number): number {
	return Math.round(sec * fps);
}

export function toSeconds(frames: number, fps: number): number {
	return frames / fps;
}
