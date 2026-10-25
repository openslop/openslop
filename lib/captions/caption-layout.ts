import {
	createTikTokStyleCaptions,
	type TikTokToken,
} from "@remotion/captions";
import type { TextTimestamp } from "@/lib/connectors/types";

export type CaptionWord = { text: string; active: boolean };

/** A page of words shown together, on screen over `[start, end)` seconds. */
export type CaptionLine = {
	/** Where the line's first token sits in the element's words; tokens map to words one to one. */
	firstWord: number;
	tokens: TikTokToken[];
	start: number;
	end: number;
};

/** The line's words, the one being spoken at `seconds` marked active. */
export function wordsAt(
	tokens: readonly TikTokToken[],
	seconds: number,
): CaptionWord[] {
	const active = tokens.findLastIndex(({ fromMs }) => fromMs <= seconds * 1000);
	return tokens.map(({ text }, index) => ({
		text: text.trim(),
		active: index === active,
	}));
}

/** Words join a line until it has run `lineMs`; each line holds until the next one starts. */
export function groupIntoLines(
	words: readonly TextTimestamp[],
	lineMs: number,
): CaptionLine[] {
	const { pages } = createTikTokStyleCaptions({
		captions: words.map(({ text, start, end }, index) => ({
			text: index === 0 ? text : ` ${text}`,
			startMs: start * 1000,
			endMs: end * 1000,
			timestampMs: null,
			confidence: null,
		})),
		combineTokensWithinMilliseconds: lineMs,
	});
	let firstWord = 0;
	return pages.map(({ startMs, durationMs, tokens }) => {
		const line = {
			firstWord,
			tokens,
			start: startMs / 1000,
			end: (startMs + durationMs) / 1000,
		};
		firstWord += tokens.length;
		return line;
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
