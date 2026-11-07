import { describe, expect, it } from "vitest";
import { extensionDuration, totalDuration } from "../sequences";

describe("extensionDuration", () => {
	const scene = { minDuration: 8 };

	it("extends a video trimmed under its scene's dialogue", () => {
		expect(extensionDuration(scene, 3)).toBe(5);
	});

	it("has none once the video outruns its dialogue", () => {
		expect(extensionDuration(scene, 10)).toBe(0);
	});
});

describe("totalDuration", () => {
	it("runs what plays and its extension", () => {
		expect(totalDuration({ duration: 3, minDuration: 8 })).toBe(8);
		expect(totalDuration({ duration: 10, minDuration: 8 })).toBe(10);
	});
});
