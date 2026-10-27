import { describe, expect, it } from "vitest";
import { joinWords, spaceBetween } from "../word-spacing";

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

	it("puts no space before punctuation timed as a word of its own", () => {
		expect(spaceBetween("Hi", ",")).toBe("");
		expect(spaceBetween("there", "?!")).toBe("");
		expect(spaceBetween("said", ")")).toBe("");
		expect(spaceBetween("said", "(")).toBe(" ");
		expect(spaceBetween("so", "-")).toBe(" ");
		expect(spaceBetween("Hi", "'cause")).toBe(" ");
	});
});

describe("joinWords", () => {
	it("joins words as each script writes them", () => {
		expect(joinWords(["Hi", "there"])).toBe("Hi there");
		expect(joinWords(["猫は", "私たちの"])).toBe("猫は私たちの");
		expect(joinWords(["Hi", ",", "there", "."])).toBe("Hi, there.");
		expect(joinWords(["猫", "は", "。"])).toBe("猫は。");
		expect(joinWords([])).toBe("");
	});
});
