import { describe, expect, it } from "vitest";
import { captionLines, groupIntoLines, wordsAt } from "../caption-layout";

const WORDS = ["one", "two", "three", "four", "five"];
/** A word a second, each spoken for most of it. */
const timed = WORDS.map((text, at) => ({ text, start: at, end: at + 0.8 }));
const spans = (lines: { firstWord: number; tokens: unknown[] }[]) =>
	lines.map(({ firstWord, tokens }) =>
		WORDS.slice(firstWord, firstWord + tokens.length),
	);

describe("wordsAt", () => {
	const [line] = groupIntoLines(timed.slice(0, 3), 3000);

	it("marks no word before the first one starts", () => {
		expect(wordsAt(line.tokens, -0.5).some(({ active }) => active)).toBe(false);
	});

	it("holds a word until the next one starts", () => {
		const active = (seconds: number) =>
			wordsAt(line.tokens, seconds).find((word) => word.active)?.text;
		expect(active(0)).toBe("one");
		expect(active(0.99)).toBe("one");
		expect(active(1)).toBe("two");
		expect(active(99)).toBe("three");
	});

	it("shows each word without the space it joined the line with", () => {
		expect(wordsAt(line.tokens, 0).map(({ text }) => text)).toEqual([
			"one",
			"two",
			"three",
		]);
	});
});

describe("groupIntoLines", () => {
	it("gathers words into a line until it has run the line length", () => {
		expect(spans(groupIntoLines(timed, 1500))).toEqual([
			["one", "two"],
			["three", "four"],
			["five"],
		]);
	});

	it("shows one word at a time at a line length of 0", () => {
		expect(spans(groupIntoLines(timed, 0))).toEqual(WORDS.map((w) => [w]));
	});

	it("holds each line until the next one starts, the last until its last word ends", () => {
		expect(
			groupIntoLines(timed, 1500).map(({ start, end }) => [start, end]),
		).toEqual([
			[0, 2],
			[2, 4],
			[4, 4.8],
		]);
	});
});

describe("captionLines", () => {
	it("holds the last line until the captions stop, and drops lines after", () => {
		const lines = captionLines({ words: timed, untilSec: 3.5 }, 1500);
		expect(
			lines.map(({ firstWord, start, end }) => [firstWord, start, end]),
		).toEqual([
			[0, 0, 2],
			[2, 2, 3.5],
		]);
		expect(captionLines({ words: timed, untilSec: 10 }, 1500).at(-1)?.end).toBe(
			10,
		);
	});
});
