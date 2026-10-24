import { describe, expect, it } from "vitest";
import {
	activeWordIndex,
	captionLines,
	groupIntoLines,
	wordsOnLine,
} from "../caption-layout";

const WORDS = ["one", "two", "three", "four", "five"];
/** A word a second, each spoken for most of it. */
const timed = WORDS.map((text, at) => ({ text, start: at, end: at + 0.8 }));
const spans = (lines: { from: number; to: number }[]) =>
	lines.map(({ from, to }) => WORDS.slice(from, to));

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

describe("groupIntoLines", () => {
	it("gathers words into a line until it has run the line length", () => {
		expect(spans(groupIntoLines(timed, 1500))).toEqual([
			["one", "two"],
			["three", "four"],
			["five"],
		]);
	});

	it("skips a blank word without shifting the words after it", () => {
		const blank = [
			timed[0],
			{ text: " ", start: 1, end: 1.5 },
			...timed.slice(1),
		];
		expect(
			groupIntoLines(blank, 0).map(({ from, to }) =>
				blank.slice(from, to).map((word) => word.text),
			),
		).toEqual(WORDS.map((w) => [w]));
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
		expect(lines.map(({ from, start, end }) => [from, start, end])).toEqual([
			[0, 0, 2],
			[2, 2, 3.5],
		]);
		expect(captionLines({ words: timed, untilSec: 10 }, 1500).at(-1)?.end).toBe(
			10,
		);
	});
});

describe("wordsOnLine", () => {
	it("marks only the word being spoken", () => {
		expect(wordsOnLine(WORDS, 3, { from: 3, to: 5 })).toEqual([
			{ text: "four", active: true },
			{ text: "five", active: false },
		]);
	});
});
