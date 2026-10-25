import {
	createTikTokStyleCaptions,
	type Caption,
	type TikTokToken,
} from "@remotion/captions";
import { joinWords, spacedApart } from "./word-spacing";

export type CaptionWord = {
	text: string;
	active: boolean;
	spaceBefore: boolean;
};

/** A page of captions shown together, on screen over `[start, end)` seconds. */
export type CaptionLine = {
	/** Where the line's first token sits in the element's captions; tokens map to captions one to one. */
	firstWordIndex: number;
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
		text,
		active: index === active,
		spaceBefore: index > 0 && spacedApart(tokens[index - 1].text, text),
	}));
}

/** Captions join a line until it has run `lineMs`; each line holds until the next one starts. */
export function groupIntoLines(
	captions: Caption[],
	lineMs: number,
	firstWordIndex = 0,
): CaptionLine[] {
	const { pages } = createTikTokStyleCaptions({
		// Remotion expects a leading space for each word, regardless of language
		captions: captions.map((caption) => ({
			...caption,
			text: ` ${caption.text}`,
		})),
		combineTokensWithinMilliseconds: lineMs,
	});
	let at = firstWordIndex;
	return pages.map(({ startMs, durationMs, tokens }) => {
		const words = tokens.map((token) => ({
			...token,
			text: token.text.trimStart(),
		}));
		const line = {
			firstWordIndex: at,
			tokens: words,
			text: joinWords(words.map(({ text }) => text)),
			start: startMs / 1000,
			end: (startMs + durationMs) / 1000,
		};
		at += tokens.length;
		return line;
	});
}

/** The lines an element shows, the last held until its captions stop. */
export function captionLines(
	{ firstWordIndex, words }: { firstWordIndex: number; words: Caption[] },
	untilSec: number,
	lineMs: number,
): CaptionLine[] {
	const lines = groupIntoLines(words, lineMs, firstWordIndex).filter(
		(line) => line.start < untilSec,
	);
	return lines.map((line, index) => ({
		...line,
		end: index === lines.length - 1 ? untilSec : line.end,
	}));
}
