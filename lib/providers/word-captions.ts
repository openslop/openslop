import type { Caption } from "@remotion/captions";
import { spacesBefore } from "@/lib/captions/word-spacing";

export type TimedToken = { text: string; start: number; end: number };

const HAS_LETTERS = /[\p{L}\p{N}]/u;

export const captionFromSeconds = (
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
	tokens.flatMap(({ text, start, end }) => {
		const word = text.trim();
		return word ? [captionFromSeconds(word, start, end)] : [];
	});

function wordStarts(text: string): Set<number> {
	const segments = new Intl.Segmenter(undefined, { granularity: "word" });
	return new Set(
		[...segments.segment(text)]
			.filter(({ isWordLike }) => isWordLike)
			.map(({ index }) => index),
	);
}

/** Joins the single characters some scripts are timed in into whole words, and punctuation onto the word before it. */
export function wordsFromCharacters(captions: readonly Caption[]): Caption[] {
	const spaced = spacesBefore(captions.map(({ text }) => text));
	const pieces = captions.map(({ text }, index) =>
		spaced[index] ? ` ${text}` : text,
	);
	const starts = wordStarts(pieces.join(""));
	const words: Caption[] = [];
	let offset = 0;
	for (const [index, caption] of captions.entries()) {
		const startsWord =
			HAS_LETTERS.test(caption.text) && (spaced[index] || starts.has(offset));
		offset += pieces[index].length;
		const last = words.at(-1);
		if (last && !startsWord)
			words[words.length - 1] = {
				...last,
				text: last.text + caption.text,
				endMs: caption.endMs,
			};
		else words.push(caption);
	}
	return words;
}
