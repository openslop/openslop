import { DURATION_MAX, snapDurationUp } from "@/lib/canvas/types";
import { hasDialogue, type ElementLength } from "./element-lengths";
import { secondsForWords } from "../project/video-length";

/** Breathing room on top of the dialogue a visual has to cover. */
export const DURATION_FIT_LEEWAY_SEC = 1;

export type GeneratedLength = ElementLength & { durationSec: number };

export type TrimmedLength = ElementLength & { trimmedSec: number };

/** The length a video should be generated at, against the length it is set to. */
export type DurationFit = {
	length: GeneratedLength;
	duration: number;
	/** Dialogue plus leeway, which no option covers once it passes DURATION_MAX. */
	needed: number;
};

/** A trim holds the clip whatever its duration, so no fit can reach it. */
export const heldByTrim = (length: ElementLength): length is TrimmedLength =>
	length.trimmedSec !== undefined;

const isFittable = (length: ElementLength): length is GeneratedLength =>
	length.durationSec !== undefined &&
	hasDialogue(length) &&
	!heldByTrim(length);

const fit = (length: GeneratedLength): DurationFit => {
	const needed = secondsForWords(length.words) + DURATION_FIT_LEEWAY_SEC;
	return { length, duration: snapDurationUp(needed), needed };
};

export const fallsShort = ({ needed }: DurationFit): boolean =>
	needed > DURATION_MAX;

/**
 * What each generated video's `duration` should be to cover the dialogue under it,
 * as `measureElementLengths` attributes it: every line between this visual and the
 * next, scene boundaries included.
 */
export const durationFits = (lengths: ElementLength[]): DurationFit[] =>
	lengths.filter(isFittable).map(fit);
