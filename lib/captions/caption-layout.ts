import {
	createTikTokStyleCaptions,
	type Caption,
	type TikTokToken,
} from "@remotion/captions";
import { closesWordBefore, joinWords } from "./word-spacing";

export type CaptionWord = {
	text: string;
	active: boolean;
};

/** A page of captions shown together. */
export type CaptionLine = {
	/** Where the line's first token sits in the element's captions; tokens map to captions one to one. */
	firstWordIndex: number;
	/** Remotion holds a line until the next one starts; the last line ends with its last word. */
	startMs: number;
	durationMs: number;
	tokens: TikTokToken[];
};

export const lineText = ({ tokens }: CaptionLine): string =>
	joinWords(tokens.map(({ text }) => text));

/** The line's words, the one being spoken at `seconds` marked active. */
export function wordsAt(
	tokens: readonly TikTokToken[],
	seconds: number,
): CaptionWord[] {
	const active = tokens.findLastIndex(({ fromMs }) => fromMs <= seconds * 1000);
	return tokens.map(({ text }, index) => ({ text, active: index === active }));
}

/** Captions join a line until it has run `lineMs`. */
export function groupIntoLines(
	captions: Caption[],
	lineMs: number,
	firstWordIndex = 0,
): CaptionLine[] {
	const { pages } = createTikTokStyleCaptions({
		// Remotion starts a line only at a word with a leading space, regardless of language
		captions: captions.map((caption) => ({
			...caption,
			text: closesWordBefore(caption.text) ? caption.text : ` ${caption.text}`,
		})),
		combineTokensWithinMilliseconds: lineMs,
	});
	const lines: CaptionLine[] = [];
	let at = firstWordIndex;
	for (const { startMs, durationMs, tokens } of pages) {
		lines.push({
			firstWordIndex: at,
			startMs,
			durationMs,
			tokens: tokens.map((token) => ({
				...token,
				text: token.text.trimStart(),
			})),
		});
		at += tokens.length;
	}
	return lines;
}
