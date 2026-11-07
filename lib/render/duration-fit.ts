import { DURATION_MAX, snapDurationUp } from "@/lib/canvas/types";
import type { VisualSpan } from "./visual-spans";
import { estimateSpeechSec } from "../project/video-length";

/** Breathing room on top of the dialogue a visual has to cover. */
export const DURATION_FIT_LEEWAY_SEC = 1;

type FittableSpan = VisualSpan & { durationSec: number };

/** The `duration` that covers a video's dialogue, against the one it is set to. */
export type DurationFit = {
	span: FittableSpan;
	duration: number;
	/** Dialogue plus leeway, which no option covers once it passes DURATION_MAX. */
	needed: number;
};

const isFittable = (span: VisualSpan): span is FittableSpan =>
	span.durationSec !== undefined && span.words > 0;

const fit = (span: FittableSpan): DurationFit => {
	const needed = estimateSpeechSec(span.words) + DURATION_FIT_LEEWAY_SEC;
	return { span, duration: snapDurationUp(needed), needed };
};

export const fallsShort = ({ needed }: DurationFit): boolean =>
	needed > DURATION_MAX;

export const durationFits = (spans: VisualSpan[]): DurationFit[] =>
	spans.filter(isFittable).map(fit);
