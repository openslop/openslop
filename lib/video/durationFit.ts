import { DURATION_MAX, snapDurationUp } from "@/lib/canvas/types";
import type { ElementLength } from "./elementLengths";
import { secondsForWords } from "./videoLength";

/** Breathing room on top of the dialogue a visual has to cover. */
export const DURATION_FIT_LEEWAY_SEC = 1;

export type ClipLength = ElementLength & { durationSec: number };

/** The length a clip should be generated at, against the length it is set to. */
export type DurationFit = {
	length: ClipLength;
	duration: number;
	/** Dialogue plus leeway, which no option covers once it passes DURATION_MAX. */
	needed: number;
};

const isClip = (length: ElementLength): length is ClipLength =>
	length.durationSec !== undefined;

const fit = (length: ClipLength): DurationFit => {
	const needed = secondsForWords(length.words) + DURATION_FIT_LEEWAY_SEC;
	return { length, duration: snapDurationUp(needed), needed };
};

export const fallsShort = ({ needed }: DurationFit): boolean =>
	needed > DURATION_MAX;

/**
 * What each generated clip's `duration` should be to cover the dialogue under it,
 * as `measureElementLengths` attributes it: every line between this visual and the
 * next, scene boundaries included. Stills carry no duration and already stretch to
 * fit, so they are left out.
 */
export const durationFits = (lengths: ElementLength[]): DurationFit[] =>
	lengths.filter(isClip).map(fit);
