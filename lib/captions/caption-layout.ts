import { createTikTokStyleCaptions } from "@remotion/captions";
import sortedLastIndex from "lodash/sortedLastIndex";
import type { TextTimestamp } from "@/lib/connectors/types";

export type CaptionWord = { text: string; active: boolean };

/** A run of words shown together, `[from, to)` into the element's words, on screen over `[start, end)` seconds. */
export type CaptionLine = {
	from: number;
	to: number;
	start: number;
	end: number;
};

/** Index of the word being spoken at `seconds`, or -1 before the first one. */
export function activeWordIndex(startTimes: number[], seconds: number): number {
	return sortedLastIndex(startTimes, seconds) - 1;
}

export const wordsOnLine = (
	words: readonly string[],
	wordIndex: number,
	{ from, to }: Pick<CaptionLine, "from" | "to">,
): CaptionWord[] =>
	words
		.slice(from, to)
		.map((text, index) => ({ text, active: from + index === wordIndex }));

/** Words join a line until it has run `lineMs`; each line holds until the next one starts. */
export function groupIntoLines(
	words: readonly TextTimestamp[],
	lineMs: number,
): CaptionLine[] {
	// The library drops blank words, so lines are counted over the spoken ones.
	const spoken = words.flatMap((word, index) =>
		word.text.trim() ? [index] : [],
	);
	const { pages } = createTikTokStyleCaptions({
		captions: spoken.map((index, at) => {
			const { text, start, end } = words[index];
			return {
				text: at === 0 ? text : ` ${text}`,
				startMs: start * 1000,
				endMs: end * 1000,
				timestampMs: null,
				confidence: null,
			};
		}),
		combineTokensWithinMilliseconds: lineMs,
	});
	let at = 0;
	return pages.map(({ startMs, durationMs, tokens }) => {
		const first = spoken[at];
		at += tokens.length;
		return {
			from: first,
			to: spoken[at - 1] + 1,
			start: startMs / 1000,
			end: (startMs + durationMs) / 1000,
		};
	});
}

/** The lines an element shows, the last held until its captions stop. */
export function captionLines(
	{ words, untilSec }: { words: readonly TextTimestamp[]; untilSec: number },
	lineMs: number,
): CaptionLine[] {
	const lines = groupIntoLines(words, lineMs).filter(
		(line) => line.start < untilSec,
	);
	return lines.map((line, index) => ({
		...line,
		end: index === lines.length - 1 ? untilSec : Math.min(line.end, untilSec),
	}));
}
