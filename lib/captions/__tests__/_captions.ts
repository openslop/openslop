import type { Caption } from "@remotion/captions";

/** A caption the way providers write it, timed in seconds so tests read plainly. */
export const caption = (
	text: string,
	startSec: number,
	endSec: number,
): Caption => ({
	text: ` ${text}`,
	startMs: startSec * 1000,
	endMs: endSec * 1000,
	timestampMs: null,
	confidence: null,
});
