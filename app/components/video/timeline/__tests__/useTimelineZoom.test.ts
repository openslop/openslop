import { describe, expect, it } from "vitest";
import { fitPxPerSec } from "../useTimelineZoom";

describe("fitPxPerSec", () => {
	it("fits the whole video across the viewport", () => {
		expect(fitPxPerSec(30, 600)).toBe(20);
	});

	it("has no scale before the viewport is measured", () => {
		expect(fitPxPerSec(30, 0)).toBe(0);
	});

	// Timeline subtracts its gutter and ruler tail from the measured width, so an
	// unmeasured (or very narrow) viewport arrives here negative.
	it("has no scale for a viewport narrower than its own chrome", () => {
		expect(fitPxPerSec(30, -72)).toBe(0);
	});

	it("has no scale for a video with no length", () => {
		expect(fitPxPerSec(0, 600)).toBe(0);
	});
});
