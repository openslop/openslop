import { describe, expect, it } from "vitest";
import { ZOOM_LEVELS } from "../use-timeline-zoom";

describe("ZOOM_LEVELS", () => {
	it("starts at 1x fit-to-width and reaches 64x maximum zoom", () => {
		expect(ZOOM_LEVELS[0]).toBe(1);
		expect(ZOOM_LEVELS[ZOOM_LEVELS.length - 1]).toBe(64);
	});

	it("steps monotonically with smooth geometric progression", () => {
		for (let i = 1; i < ZOOM_LEVELS.length; i++) {
			expect(ZOOM_LEVELS[i]).toBeGreaterThan(ZOOM_LEVELS[i - 1]);
		}
	});

	it("preserves previous standard zoom stops", () => {
		const baselineStops = [1, 1.5, 2, 3, 4, 6, 8];
		for (const stop of baselineStops) {
			expect(ZOOM_LEVELS).toContain(stop);
		}
	});

	it("contains intermediate steps between stops for smoother zooming", () => {
		expect(ZOOM_LEVELS.length).toBeGreaterThan(15);
		expect(ZOOM_LEVELS).toContain(1.25);
		expect(ZOOM_LEVELS).toContain(2.5);
		expect(ZOOM_LEVELS).toContain(12);
		expect(ZOOM_LEVELS).toContain(32);
	});
});
