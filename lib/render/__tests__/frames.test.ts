import { describe, expect, it } from "vitest";
import { toFrames, toSeconds } from "../frames";

describe("toFrames", () => {
	it("rounds to the nearest whole frame, the way Remotion does", () => {
		expect(toFrames(0.4, 24)).toBe(10);
		expect(toFrames(0.4, 25)).toBe(10);
		expect(toFrames(0.4, 30)).toBe(12);
	});

	it("does not truncate a sub-frame duration away", () => {
		expect(toFrames(1 / 48, 24)).toBe(1);
	});
});

describe("toSeconds", () => {
	it("inverts toFrames for a duration on the grid", () => {
		expect(toSeconds(toFrames(2.5, 24), 24)).toBe(2.5);
	});
});
