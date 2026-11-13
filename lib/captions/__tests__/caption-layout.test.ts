import { describe, expect, it } from "vitest";
import { groupIntoLines, lineText, wordsAt } from "../caption-layout";
import { toCaption } from "../word-captions";

const WORDS = ["one", "two", "three", "four", "five"];
/** A word a second, each spoken for most of it. */
const timed = WORDS.map((text, at) => toCaption(text, at, at + 0.8));
const spans = (lines: { firstWordIndex: number; tokens: unknown[] }[]) =>
	lines.map(({ firstWordIndex, tokens }) =>
		WORDS.slice(firstWordIndex, firstWordIndex + tokens.length),
	);

describe("wordsAt", () => {
	const [line] = groupIntoLines(timed.slice(0, 3), 3000);
	const active = (seconds: number) =>
		wordsAt(line.tokens, seconds).find((word) => word.active)?.text;

	it("marks no word before the first one starts", () => {
		expect(active(-0.5)).toBeUndefined();
	});

	it("holds a word until the next one starts", () => {
		expect(active(0)).toBe("one");
		expect(active(0.99)).toBe("one");
		expect(active(1)).toBe("two");
		expect(active(99)).toBe("three");
	});

	it("shows each word as stored, joined with spaces in the line's text", () => {
		expect(wordsAt(line.tokens, 0).map(({ text }) => text)).toEqual([
			"one",
			"two",
			"three",
		]);
		expect(lineText(line)).toBe("one two three");
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

	it("breaks lines in a language written without spaces, and draws none between its words", () => {
		const unspaced = ["今日", "は", "晴れ", "です"].map((text, at) =>
			toCaption(text, at, at + 0.8),
		);
		const lines = groupIntoLines(unspaced, 1500);
		expect(lines.map(lineText)).toEqual(["今日は", "晴れです"]);
		expect(lines.map(({ firstWordIndex }) => firstWordIndex)).toEqual([0, 2]);
	});

	it("never starts a line with punctuation timed on its own", () => {
		const punctuated = [
			"こ",
			"ん",
			"に",
			"ち",
			"は",
			"、",
			"世",
			"界",
			"！",
		].map((text, at) => toCaption(text, at, at + 0.8));
		const lines = groupIntoLines(punctuated, 1500);
		expect(lines.map(({ firstWordIndex }) => firstWordIndex)).toEqual([
			0, 2, 4, 6,
		]);
		expect(lines.map(lineText)).toEqual(["こん", "にち", "は、", "世界！"]);
		expect(groupIntoLines(punctuated, 0).map(lineText)).toEqual([
			"こ",
			"ん",
			"に",
			"ち",
			"は、",
			"世",
			"界！",
		]);
	});

	it("shows one word at a time at a line length of 0", () => {
		expect(spans(groupIntoLines(timed, 0))).toEqual(WORDS.map((w) => [w]));
	});

	it("counts each line's first word from where the trim left the element's words", () => {
		expect(
			groupIntoLines(timed, 1500, 3).map(
				({ firstWordIndex }) => firstWordIndex,
			),
		).toEqual([3, 5, 7]);
	});
});
