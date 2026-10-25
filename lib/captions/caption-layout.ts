import {
	createTikTokStyleCaptions,
	type Caption,
	type TikTokToken,
} from "@remotion/captions";

export type CaptionWord = { text: string; active: boolean };

/** A page of captions shown together, on screen over `[start, end)` seconds. */
export type CaptionLine = {
	/** Where the line's first token sits in the element's captions; tokens map to captions one to one. */
	firstWord: number;
	tokens: TikTokToken[];
	text: string;
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

/** Captions join a line until it has run `lineMs`; each line holds until the next one starts. */
export function groupIntoLines(
	captions: Caption[],
	lineMs: number,
	firstWord = 0,
): CaptionLine[] {
	const { pages } = createTikTokStyleCaptions({
		captions,
		combineTokensWithinMilliseconds: lineMs,
	});
	let at = firstWord;
	return pages.map(({ text, startMs, durationMs, tokens }) => {
		const line = {
			firstWord: at,
			tokens,
			text,
			start: startMs / 1000,
			end: (startMs + durationMs) / 1000,
		};
		at += tokens.length;
		return line;
	});
}

/** The lines an element shows, the last held until its captions stop. */
export function captionLines(
	{ firstWord, words }: { firstWord: number; words: Caption[] },
	untilSec: number,
	lineMs: number,
): CaptionLine[] {
	const lines = groupIntoLines(words, lineMs, firstWord).filter(
		(line) => line.start < untilSec,
	);
	return lines.map((line, index) => ({
		...line,
		end: index === lines.length - 1 ? untilSec : line.end,
	}));
}
