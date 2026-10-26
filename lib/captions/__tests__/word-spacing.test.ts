import { describe, expect, it } from "vitest";
import { joinWords, spacesBefore } from "../word-spacing";

describe("spacesBefore", () => {
	it("spaces words apart in scripts that space their words, never before the first", () => {
		expect(spacesBefore(["hello", "world"])).toEqual([false, true]);
		expect(spacesBefore(["बिल्ली", "हम"])).toEqual([false, true]);
	});

	it("runs words together when either side is written without spaces", () => {
		expect(spacesBefore(["猫", "は"])).toEqual([false, false]);
		expect(spacesBefore(["我们", "都"])).toEqual([false, false]);
		expect(spacesBefore(["AI", "は"])).toEqual([false, false]);
		expect(spacesBefore(["สวัสดี", "ครับ"])).toEqual([false, false]);
	});
});

describe("joinWords", () => {
	it("joins words as each script writes them", () => {
		expect(joinWords(["Hi", "there"])).toBe("Hi there");
		expect(joinWords(["猫は", "私たちの"])).toBe("猫は私たちの");
		expect(joinWords([])).toBe("");
	});
});
