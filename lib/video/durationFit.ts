import { DURATION_OPTIONS } from "@/lib/canvas/types";
import { clamp } from "@/lib/utils";
import type { ElementLength } from "./elementLengths";

const DURATIONS = DURATION_OPTIONS.map(Number);
const SHORTEST = Math.min(...DURATIONS);

/** The longest a clip can be generated at, so the ceiling on what one visual covers. */
export const LONGEST_DURATION_SEC = Math.max(...DURATIONS);

/** Breathing room on top of the dialogue a visual has to cover. */
export const DURATION_FIT_LEEWAY_SEC = 1;

/** The length a clip should be generated at, against the length it is set to. */
export type DurationFit = {
	length: ElementLength & { durationSec: number };
	duration: number;
	/** Dialogue plus leeway, before the options clamp it. */
	needed: number;
	/** The dialogue outruns the longest option, so no single clip covers it. */
	short: boolean;
};

const fit = (length: ElementLength & { durationSec: number }): DurationFit => {
	const needed = length.dialogueSec + DURATION_FIT_LEEWAY_SEC;
	return {
		length,
		duration: clamp(Math.ceil(needed), SHORTEST, LONGEST_DURATION_SEC),
		needed,
		short: needed > LONGEST_DURATION_SEC,
	};
};

/**
 * What each generated clip's `duration` should be to cover the dialogue under it,
 * as `measureElementLengths` attributes it: every line between this visual and the
 * next, scene boundaries included. Stills carry no duration and already stretch to
 * fit, so they are left out.
 */
export const durationFits = (lengths: ElementLength[]): DurationFit[] =>
	lengths.flatMap((length) =>
		length.durationSec === undefined
			? []
			: [fit({ ...length, durationSec: length.durationSec })],
	);
