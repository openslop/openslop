import { describe, expect, it } from "vitest";
import { trimmedWords, wordsFromCharacters } from "../word-captions";

const tokens = (texts: string[]) =>
	texts.map((text, at) => ({ text, start: at, end: at + 1 }));
const textsOf = (texts: string[]) =>
	wordsFromCharacters(trimmedWords(tokens(texts))).map(({ text }) => text);

describe("trimmedWords", () => {
	it("trims each word of the spaces a provider leads it with", () => {
		expect(
			trimmedWords(tokens([" बिल्ली", " हम", "there"])).map(({ text }) => text),
		).toEqual(["बिल्ली", "हम", "there"]);
	});

	it("drops blank tokens such as a provider's spacing", () => {
		expect(
			trimmedWords(tokens(["Hi", " ", "there"])).map(({ text }) => text),
		).toEqual(["Hi", "there"]);
	});
});

describe("wordsFromCharacters", () => {
	it("keeps words in scripts written with spaces as they are", () => {
		expect(textsOf(["Hi", "there"])).toEqual(["Hi", "there"]);
		expect(textsOf(["बिल्ली", "हम", "सबसे"])).toEqual(["बिल्ली", "हम", "सबसे"]);
	});

	it("joins the characters of a script written without spaces into its words", () => {
		const words = textsOf([
			"猫",
			"は",
			"私",
			"た",
			"ち",
			"の",
			"誰",
			"よ",
			"り",
			"も",
		]);
		expect(words.join("")).toBe("猫は私たちの誰よりも");
		expect(words.length).toBeLessThan(10);
	});

	it("keeps punctuation on the word before it", () => {
		expect(textsOf(["Hi", ",", "there", "."])).toEqual(["Hi,", "there."]);
		expect(textsOf(["路", "。"]).join("|")).toBe("路。");
	});

	it("times a joined word from its first character to its last", () => {
		const [word] = wordsFromCharacters(trimmedWords(tokens(["Hi", "!"])));
		expect([word.startMs, word.endMs]).toEqual([0, 2000]);
	});
});
