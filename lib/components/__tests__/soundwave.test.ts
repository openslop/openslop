import { describe, expect, it } from "vitest";
import { buildSoundwaveMask, toBarHeights } from "../soundwave";

const points = (mask: string) => {
	const match = decodeURIComponent(mask).match(/points="([^"]+)"/);
	return (match?.[1] ?? "")
		.split(" ")
		.map((pair) => pair.split(",").map(Number));
};

describe("buildSoundwaveMask", () => {
	it("mirrors every height around the centreline", () => {
		const coords = points(buildSoundwaveMask([10, 20, 30]));
		// Three points along the top edge, the same three back along the bottom.
		expect(coords).toHaveLength(6);
		expect(coords[0]).toEqual([0, 45]);
		expect(coords[coords.length - 1]).toEqual([0, 55]);
	});

	it("spreads the envelope evenly across the 0–100 viewBox", () => {
		const coords = points(buildSoundwaveMask([50, 50, 50, 50, 50]));
		expect(coords.slice(0, 5).map(([x]) => x)).toEqual([0, 25, 50, 75, 100]);
	});

	it("draws a lone height as a flat band", () => {
		const coords = points(buildSoundwaveMask([40]));
		expect(coords).toEqual([
			[0, 30],
			[100, 30],
			[100, 70],
			[0, 70],
		]);
	});

	it("produces a data URL mask", () => {
		const mask = buildSoundwaveMask([10]);
		expect(mask.startsWith('url("data:image/svg+xml,')).toBe(true);
	});
});

describe("toBarHeights", () => {
	it("spreads a lone spike into its neighbours", () => {
		const heights = toBarHeights([0, 0, 1, 0, 0], 5);
		expect(heights[2]).toBeCloseTo(100 / 3);
		expect(heights[1]).toBeCloseTo(heights[2]);
		expect(heights[3]).toBeCloseTo(heights[2]);
	});

	it("keeps silence on a hairline rather than nothing", () => {
		expect(toBarHeights([0, 0, 0], 3).every((h) => h > 0)).toBe(true);
	});

	it("has nothing to draw without peaks", () => {
		expect(toBarHeights([], 8)).toEqual([]);
	});
});
