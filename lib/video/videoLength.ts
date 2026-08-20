export const VIDEO_LENGTH_TARGETS = [
	"under-30s",
	"under-1m",
	"1-3m",
	"3-5m",
	"5-10m",
	"10-15m",
] as const;

/** `auto` is a choice, not an absence: write to fit the material, on no budget. */
export const VIDEO_LENGTHS = ["auto", ...VIDEO_LENGTH_TARGETS] as const;

export type VideoLengthTarget = (typeof VIDEO_LENGTH_TARGETS)[number];
export type VideoLength = (typeof VIDEO_LENGTHS)[number];

export const DEFAULT_VIDEO_LENGTH: VideoLength = "auto";

export const NARRATION_WORDS_PER_MINUTE = 180;

const wordsForSeconds = (sec: number): number =>
	Math.round((sec * NARRATION_WORDS_PER_MINUTE) / 600) * 10;

export type VideoLengthSpec = {
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
} satisfies Record<VideoLengthTarget, VideoLengthSpec>;

/** The spoken-word budget a length imposes, or nothing when it imposes none. */
export const videoLengthBudget = (
	length: VideoLength,
): VideoLengthSpec | undefined =>
	length === "auto" ? undefined : VIDEO_LENGTH_SPECS[length];

export const videoLengthLabel = (length: VideoLength): string =>
	length === "auto" ? "Auto" : VIDEO_LENGTH_SPECS[length].label;
