import { snapDurationUp } from "@/lib/canvas/types";
import type { VisualSpan } from "./visual-spans";
import { estimateSpeechSec } from "../project/video-length";

/** Breathing room on top of the speech a visual has to cover. */
export const DURATION_FIT_LEEWAY_SEC = 1;

type FittableSpan = VisualSpan & {
	durationSec: number;
	maxDurationSec: number;
};

/** The `duration` that covers a video's speech, against the one it is set to. */
export type DurationFit = {
	span: FittableSpan;
	duration: number;
	/** Speech plus leeway, which no option covers once it passes the span's maxDurationSec. */
	needed: number;
};

const isFittable = (span: VisualSpan): span is FittableSpan =>
	span.durationSec !== undefined &&
	span.maxDurationSec !== undefined &&
	span.words > 0;

const fit = (span: FittableSpan): DurationFit => {
	const needed = estimateSpeechSec(span.words) + DURATION_FIT_LEEWAY_SEC;
	return {
		span,
		duration: snapDurationUp(needed, span.maxDurationSec),
		needed,
	};
};

export const fallsShort = ({ span, needed }: DurationFit): boolean =>
	needed > span.maxDurationSec;

export const durationFits = (spans: VisualSpan[]): DurationFit[] =>
	spans.filter(isFittable).map(fit);
