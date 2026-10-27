import { describe, expect, it } from "vitest";
import { joinWords, spaceBetween, spacedWords } from "../word-spacing";

describe("spaceBetween", () => {
	it("spaces words apart in scripts that space their words, never before the first", () => {
		expect(spaceBetween("hello", "world")).toBe(" ");
		expect(spaceBetween("बिल्ली", "हम")).toBe(" ");
		expect(spaceBetween(undefined, "hello")).toBe("");
	});

	it("runs words together when either side is written without spaces", () => {
		expect(spaceBetween("猫", "は")).toBe("");
		expect(spaceBetween("我们", "都")).toBe("");
		expect(spaceBetween("AI", "は")).toBe("");
		expect(spaceBetween("สวัสดี", "ครับ")).toBe("");
	});
});

describe("spacedWords", () => {
	it("leads each word with the space its script takes", () => {
		expect(spacedWords(["Hi", "there", "猫", "は"])).toEqual([
			"Hi",
			" there",
			"猫",
			"は",
		]);
	});
});

describe("joinWords", () => {
	it("joins words as each script writes them", () => {
		expect(joinWords(["Hi", "there"])).toBe("Hi there");
		expect(joinWords(["猫は", "私たちの"])).toBe("猫は私たちの");
		expect(joinWords([])).toBe("");
	});
});
