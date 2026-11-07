import { describe, expect, it } from "vitest";
import { holdDuration, totalDuration } from "../sequences";

describe("holdDuration", () => {
	const scene = { minDuration: 8 };

	it("holds a video trimmed under its scene's dialogue", () => {
		expect(holdDuration(scene, 3)).toBe(5);
	});

	it("has none once the video outruns its dialogue", () => {
		expect(holdDuration(scene, 10)).toBe(0);
	});
});

describe("totalDuration", () => {
	it("runs what plays and the hold after it", () => {
		expect(totalDuration({ duration: 3, minDuration: 8 })).toBe(8);
		expect(totalDuration({ duration: 10, minDuration: 8 })).toBe(10);
	});
});
