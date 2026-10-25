import { describe, expect, it } from "vitest";
import { wordCaptions } from "../word-captions";

const tokens = (texts: string[]) =>
	texts.map((text, at) => ({ text, start: at, end: at + 1 }));
const textsOf = (texts: string[]) =>
	wordCaptions(tokens(texts)).map(({ text }) => text);

describe("wordCaptions", () => {
	it("trims each word of the spaces a provider leads it with", () => {
		expect(textsOf([" बिल्ली", " हम", " सबसे"])).toEqual([
			"बिल्ली",
			"हम",
			"सबसे",
		]);
		expect(textsOf(["Hi", "there"])).toEqual(["Hi", "there"]);
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

	it("drops blank tokens such as a provider's spacing", () => {
		expect(textsOf(["Hi", " ", "there"])).toEqual(["Hi", "there"]);
	});

	it("times a joined word from its first token to its last", () => {
		const [word] = wordCaptions(tokens(["Hi", "!"]));
		expect([word.startMs, word.endMs]).toEqual([0, 2000]);
	});
});
