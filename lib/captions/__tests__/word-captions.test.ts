import { describe, expect, it } from "vitest";
import { trimmedWords } from "../word-captions";

const tokens = (texts: string[]) =>
	texts.map((text, at) => ({ text, start: at, end: at + 1 }));

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
