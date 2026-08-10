import sortedLastIndex from "lodash/sortedLastIndex";
import type { CaptionReveal } from "./captionStyle";

export type CaptionWord = { text: string; active: boolean };

/** Index of the word being spoken at `seconds`, or -1 before the first one. */
export function activeWordIndex(startTimes: number[], seconds: number): number {
	return sortedLastIndex(startTimes, seconds) - 1;
}

/**
 * The words on screen when `wordIndex` is being spoken. Lines are fixed-size
 * runs of `maxWordsPerLine`, so the line is a slice rather than a lookup.
 */
export function captionWordsAt(
	words: readonly string[],
	wordIndex: number,
	{
		maxWordsPerLine,
		reveal,
	}: { maxWordsPerLine: number; reveal: CaptionReveal },
): CaptionWord[] {
	if (wordIndex < 0 || wordIndex >= words.length) return [];

	const perLine = Math.max(1, Math.floor(maxWordsPerLine));
	const lineStart = Math.floor(wordIndex / perLine) * perLine;
	const activeInLine = wordIndex - lineStart;
	const line = words.slice(lineStart, lineStart + perLine);
	const visible = reveal === "word" ? line.slice(0, activeInLine + 1) : line;

	return visible.map((text, i) => ({ text, active: i === activeInLine }));
}
