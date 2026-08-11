import { describe, expect, it } from "vitest";
import { alphaPercent, withAlphaPercent } from "../hexAlpha";

describe("alphaPercent", () => {
	it("reads a six-digit hex as opaque", () => {
		expect(alphaPercent("#ffffff")).toBe(100);
	});

	it("reads shorthand hex, with and without its alpha digit", () => {
		expect(alphaPercent("#fff")).toBe(100);
		expect(alphaPercent("#fff8")).toBe(53);
	});

	it("reads the trailing pair of an eight-digit hex", () => {
		expect(alphaPercent("#ffffff00")).toBe(0);
		expect(alphaPercent("#ffffff80")).toBe(50);
		expect(alphaPercent("#ffffffff")).toBe(100);
	});
});

describe("withAlphaPercent", () => {
	it("writes the percentage into the trailing pair", () => {
		expect(withAlphaPercent("#336699", 0)).toBe("#33669900");
		expect(withAlphaPercent("#336699", 100)).toBe("#336699ff");
	});

	it("replaces an existing alpha rather than appending", () => {
		expect(withAlphaPercent("#33669900", 100)).toBe("#336699ff");
	});

	it("clamps out-of-range percentages", () => {
		expect(withAlphaPercent("#336699", 140)).toBe("#336699ff");
		expect(withAlphaPercent("#336699", -20)).toBe("#33669900");
	});

	it("expands shorthand hex before writing the pair", () => {
		expect(withAlphaPercent("#fb0", 100)).toBe("#ffbb00ff");
		expect(withAlphaPercent("#fb08", 0)).toBe("#ffbb0000");
	});

	it("keeps the color when the field holds no number", () => {
		expect(withAlphaPercent("#33669980", Number.NaN)).toBe("#33669980");
	});
});
