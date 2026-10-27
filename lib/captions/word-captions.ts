import type { Caption } from "@remotion/captions";

export type TimedToken = { text: string; start: number; end: number };

export const toCaption = (
	text: string,
	startSec: number,
	endSec: number,
): Caption => ({
	text,
	startMs: startSec * 1000,
	endMs: endSec * 1000,
	timestampMs: null,
	confidence: null,
});

/** Words a provider may lead with a space, trimmed, and the blanks it times as spacing dropped. */
export const trimmedWords = (tokens: readonly TimedToken[]): Caption[] =>
	tokens
		.map(({ text, start, end }) => toCaption(text.trim(), start, end))
		.filter(({ text }) => text !== "");
