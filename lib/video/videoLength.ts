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

const NARRATION_WORDS_PER_MINUTE = 180;

const wordsForSeconds = (sec: number): number =>
	Math.round((sec * NARRATION_WORDS_PER_MINUTE) / 600) * 10;

type VideoLengthSpec = {
	label: string;
	minWords: number;
	maxWords: number;
};

const spec = (
	label: string,
	minSec: number,
	maxSec: number,
): VideoLengthSpec => ({
	label,
	minWords: wordsForSeconds(minSec),
	maxWords: wordsForSeconds(maxSec),
});

export const VIDEO_LENGTH_SPECS = {
	"under-30s": spec("Under 30 sec", 15, 30),
	"under-1m": spec("Under 1 min", 30, 60),
	"1-3m": spec("1-3 min", 60, 180),
	"3-5m": spec("3-5 min", 180, 300),
	"5-10m": spec("5-10 min", 300, 600),
	"10-15m": spec("10-15 min", 600, 900),
} satisfies Record<VideoLength, VideoLengthSpec>;
