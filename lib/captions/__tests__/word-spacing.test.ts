import { describe, expect, it } from "vitest";
import { joinWords, spacedApart } from "../word-spacing";

describe("spacedApart", () => {
	it("spaces words apart in scripts that space their words", () => {
		expect(spacedApart("hello", "world")).toBe(true);
		expect(spacedApart("बिल्ली", "हम")).toBe(true);
	});

	it("runs words together when either side is written without spaces", () => {
		expect(spacedApart("猫", "は")).toBe(false);
		expect(spacedApart("我们", "都")).toBe(false);
		expect(spacedApart("AI", "は")).toBe(false);
		expect(spacedApart("สวัสดี", "ครับ")).toBe(false);
	});
});

describe("joinWords", () => {
	it("joins words as each script writes them", () => {
		expect(joinWords(["Hi", "there"])).toBe("Hi there");
		expect(joinWords(["猫は", "私たちの"])).toBe("猫は私たちの");
		expect(joinWords([])).toBe("");
	});
});
