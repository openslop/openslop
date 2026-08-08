export const VIDEO_LENGTHS = [
	"under-30s",
	"under-1m",
	"1-3m",
	"3-5m",
	"5-10m",
	"10-15m",
] as const;

export type VideoLength = (typeof VIDEO_LENGTHS)[number];

export const DEFAULT_VIDEO_LENGTH: VideoLength = "3-5m";

/**
 * Deliberately above the measured rate of ~150. Models undershoot a word budget,
 * so overstating it lands the runtime closer to the target.
 */
const NARRATION_WORDS_PER_MINUTE = 180;

/** Rounded to the nearest ten so the model reads a budget, not a false precision. */
const wordsForSeconds = (sec: number): number =>
	Math.round((sec * NARRATION_WORDS_PER_MINUTE) / 600) * 10;

/**
 * Observed natural length of one spoken line. Length comes from more lines rather
 * than longer ones: stretching a line leaves its image on screen too long.
 */
export const WORDS_PER_SPOKEN_ELEMENT = 30;

type VideoLengthSpec = {
	label: string;
	minWords: number;
	maxWords: number;
	minElements: number;
	maxElements: number;
};

const spec = (
	label: string,
	minSec: number,
	maxSec: number,
): VideoLengthSpec => {
	const minWords = wordsForSeconds(minSec);
	const maxWords = wordsForSeconds(maxSec);
	return {
		label,
		minWords,
		maxWords,
		minElements: Math.round(minWords / WORDS_PER_SPOKEN_ELEMENT),
		maxElements: Math.round(maxWords / WORDS_PER_SPOKEN_ELEMENT),
	};
};

/**
 * A model cannot feel duration, and scene breaks are added on serialization so it
 * cannot count those either. It can count the tags it types, so `label` is for the
 * UI and only word and element counts are ever shown to a model.
 */
export const VIDEO_LENGTH_SPECS = {
	"under-30s": spec("Under 30 sec", 15, 30),
	"under-1m": spec("Under 1 min", 30, 60),
	"1-3m": spec("1-3 min", 60, 180),
	"3-5m": spec("3-5 min", 180, 300),
	"5-10m": spec("5-10 min", 300, 600),
	"10-15m": spec("10-15 min", 600, 900),
} satisfies Record<VideoLength, VideoLengthSpec>;

export const resolveVideoLength = (metadata: {
	videoSettings?: { length?: VideoLength };
}): VideoLength => metadata.videoSettings?.length ?? DEFAULT_VIDEO_LENGTH;

export const resolveVideoLengthSpec = (metadata: {
	videoSettings?: { length?: VideoLength };
}): VideoLengthSpec => VIDEO_LENGTH_SPECS[resolveVideoLength(metadata)];
