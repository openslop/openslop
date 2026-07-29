import { describe, expect, it } from "vitest";
import {
	ACCESS_CODE_LENGTH,
	emptyAccessCode,
	eraseBefore,
	isComplete,
	pasteCode,
	typeChar,
} from "../accessCode";

const code = (s: string) => emptyAccessCode().map((_, i) => s[i] ?? "");

describe("typeChar", () => {
	it("uppercases and advances to the next box", () => {
		expect(typeChar(emptyAccessCode(), 0, "a")).toEqual({
			values: code("A"),
			focusIndex: 1,
		});
	});

	it("keeps only the last character when a box already holds one", () => {
		expect(typeChar(code("A"), 0, "AB")?.values).toEqual(code("B"));
	});

	it("rejects characters outside A-Z0-9", () => {
		expect(typeChar(emptyAccessCode(), 0, "-")).toBeNull();
	});

	it("clears the box without moving focus", () => {
		expect(typeChar(code("AB"), 1, "")).toEqual({
			values: code("A"),
			focusIndex: null,
		});
	});

	it("stays put on the last box", () => {
		const last = ACCESS_CODE_LENGTH - 1;
		expect(typeChar(code("ABCDE"), last, "F")).toEqual({
			values: code("ABCDEF"),
			focusIndex: null,
		});
	});
});

describe("eraseBefore", () => {
	it("clears and focuses the previous box when the current one is empty", () => {
		expect(eraseBefore(code("AB"), 2)).toEqual({
			values: code("A"),
			focusIndex: 1,
		});
	});

	it("does nothing when the current box has a character", () => {
		expect(eraseBefore(code("AB"), 1)).toBeNull();
	});

	it("does nothing at the first box", () => {
		expect(eraseBefore(emptyAccessCode(), 0)).toBeNull();
	});
});

describe("pasteCode", () => {
	it("strips separators and fills every box", () => {
		expect(pasteCode("ab3-d5f")).toEqual({
			values: code("AB3D5F"),
			focusIndex: null,
		});
	});

	it("focuses the first empty box after a partial paste", () => {
		expect(pasteCode("abc")).toEqual({ values: code("ABC"), focusIndex: 3 });
	});

	it("truncates past the code length", () => {
		expect(pasteCode("ABCDEFGH")?.values).toEqual(code("ABCDEF"));
	});

	it("ignores a paste with no usable characters", () => {
		expect(pasteCode("!!!")).toBeNull();
	});
});

describe("isComplete", () => {
	it("is true only when every box is filled", () => {
		expect(isComplete(code("ABCDEF"))).toBe(true);
		expect(isComplete(code("ABCDE"))).toBe(false);
	});
});
