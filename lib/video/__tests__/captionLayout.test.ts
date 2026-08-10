import { describe, expect, it } from "vitest";
import { activeWordIndex, captionWordsAt } from "../captionLayout";

const WORDS = ["one", "two", "three", "four", "five"];
const text = (words: { text: string }[]) => words.map((w) => w.text);
const activeText = (words: { text: string; active: boolean }[]) =>
	words.filter((w) => w.active).map((w) => w.text);

describe("activeWordIndex", () => {
	const startTimes = [0, 1, 2];

	it("is -1 before the first word", () => {
		expect(activeWordIndex(startTimes, -0.5)).toBe(-1);
	});

	it("holds a word until the next one starts", () => {
		expect(activeWordIndex(startTimes, 0)).toBe(0);
		expect(activeWordIndex(startTimes, 0.99)).toBe(0);
		expect(activeWordIndex(startTimes, 1)).toBe(1);
		expect(activeWordIndex(startTimes, 99)).toBe(2);
	});
});

describe("captionWordsAt", () => {
	const line = { maxWordsPerLine: 2, reveal: "line" } as const;
	const word = { maxWordsPerLine: 2, reveal: "word" } as const;

	it("is empty outside the word range", () => {
		expect(captionWordsAt(WORDS, -1, line)).toEqual([]);
		expect(captionWordsAt(WORDS, WORDS.length, line)).toEqual([]);
	});

	it("shows the whole line the word sits on", () => {
		expect(text(captionWordsAt(WORDS, 2, line))).toEqual(["three", "four"]);
	});

	it("builds the line up to the current word", () => {
		expect(text(captionWordsAt(WORDS, 2, word))).toEqual(["three"]);
		expect(text(captionWordsAt(WORDS, 3, word))).toEqual(["three", "four"]);
	});

	it("marks only the current word active", () => {
		expect(activeText(captionWordsAt(WORDS, 3, line))).toEqual(["four"]);
	});

	it("keeps a trailing partial line intact", () => {
		expect(text(captionWordsAt(WORDS, 4, line))).toEqual(["five"]);
	});

	it("falls back to one word per line for degenerate limits", () => {
		const words = captionWordsAt(WORDS, 3, {
			maxWordsPerLine: 0,
			reveal: "line",
		});
		expect(text(words)).toEqual(["four"]);
	});
});
