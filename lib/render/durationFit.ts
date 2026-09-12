import { DURATION_MAX, snapDurationUp } from "@/lib/canvas/types";
import type { ElementLength } from "./elementLengths";
import { secondsForWords } from "../project/videoLength";

/** Breathing room on top of the dialogue a visual has to cover. */
export const DURATION_FIT_LEEWAY_SEC = 1;

export type GeneratedLength = ElementLength & { durationSec: number };

/** The length a video should be generated at, against the length it is set to. */
export type DurationFit = {
	length: GeneratedLength;
	duration: number;
	/** Dialogue plus leeway, which no option covers once it passes DURATION_MAX. */
	needed: number;
};

const hasOwnDuration = (length: ElementLength): length is GeneratedLength =>
	length.durationSec !== undefined;

const fit = (length: GeneratedLength): DurationFit => {
	const needed = secondsForWords(length.words) + DURATION_FIT_LEEWAY_SEC;
	return { length, duration: snapDurationUp(needed), needed };
};

export const fallsShort = ({ needed }: DurationFit): boolean =>
	needed > DURATION_MAX;

/**
 * What each generated video's `duration` should be to cover the dialogue under it,
 * as `measureElementLengths` attributes it: every line between this visual and the
 * next, scene boundaries included. Stills carry no duration and already stretch to
 * fit, so they are left out.
 */
export const durationFits = (lengths: ElementLength[]): DurationFit[] =>
	lengths.filter(hasOwnDuration).map(fit);
