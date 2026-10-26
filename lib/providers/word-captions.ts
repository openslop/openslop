import type { Caption } from "@remotion/captions";
import { spacesBefore } from "@/lib/captions/word-spacing";

export type TimedToken = { text: string; start: number; end: number };

const HAS_LETTERS = /[\p{L}\p{N}]/u;

export const secondsCaption = (
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

function wordStarts(text: string): Set<number> {
	const segments = new Intl.Segmenter(undefined, { granularity: "word" });
	return new Set(
		[...segments.segment(text)]
			.filter(({ isWordLike }) => isWordLike)
			.map(({ index }) => index),
	);
}

/** Providers time tokens, single characters in some scripts; a caption is a whole word, without spaces. */
export function wordCaptions(tokens: readonly TimedToken[]): Caption[] {
	const parts = tokens
		.map((token) => ({ ...token, text: token.text.trim() }))
		.filter(({ text }) => text !== "");
	const spaced = spacesBefore(parts.map(({ text }) => text));
	const pieces = parts.map(({ text }, index) =>
		spaced[index] ? ` ${text}` : text,
	);
	const starts = wordStarts(pieces.join(""));
	const words: Caption[] = [];
	let offset = 0;
	parts.forEach((part, index) => {
		const at = offset + (spaced[index] ? 1 : 0);
		offset += pieces[index].length;
		const last = words.at(-1);
		const startsWord =
			HAS_LETTERS.test(part.text) && (spaced[index] || starts.has(at));
		if (last && !startsWord) {
			last.text += part.text;
			last.endMs = part.end * 1000;
		} else words.push(secondsCaption(part.text, part.start, part.end));
	});
	return words;
}
