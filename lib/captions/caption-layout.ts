import {
	createTikTokStyleCaptions,
	type Caption,
	type TikTokToken,
} from "@remotion/captions";
import { joinWords, spacesBefore } from "./word-spacing";

export type CaptionWord = {
	text: string;
	active: boolean;
	spaceBefore: boolean;
};

/** A page of captions shown together. */
export type CaptionLine = {
	/** Where the line's first token sits in the element's captions; tokens map to captions one to one. */
	firstWordIndex: number;
	tokens: TikTokToken[];
};

export const lineSpanSec = ({ tokens }: CaptionLine) => ({
	fromSec: tokens[0].fromMs / 1000,
	toSec: tokens[tokens.length - 1].toMs / 1000,
});

export const lineText = ({ tokens }: CaptionLine): string =>
	joinWords(tokens.map(({ text }) => text));

/** The line's words, the one being spoken at `seconds` marked active. */
export function wordsAt(
	tokens: readonly TikTokToken[],
	seconds: number,
): CaptionWord[] {
	const active = tokens.findLastIndex(({ fromMs }) => fromMs <= seconds * 1000);
	const spaced = spacesBefore(tokens.map(({ text }) => text));
	return tokens.map(({ text }, index) => ({
		text,
		active: index === active,
		spaceBefore: spaced[index],
	}));
}

/** Captions join a line until it has run `lineMs`. */
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
	const lines: CaptionLine[] = [];
	let at = firstWordIndex;
	for (const { tokens } of pages) {
		lines.push({
			firstWordIndex: at,
			tokens: tokens.map((token) => ({
				...token,
				text: token.text.trimStart(),
			})),
		});
		at += tokens.length;
	}
	return lines;
}
