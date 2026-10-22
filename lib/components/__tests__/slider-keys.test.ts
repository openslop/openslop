import { describe, expect, it } from "vitest";
import { sliderKeyTarget } from "../slider-keys";

describe("sliderKeyTarget", () => {
	it.each([
		["ArrowRight", 0.75],
		["ArrowUp", 0.75],
		["ArrowLeft", 0.25],
		["ArrowDown", 0.25],
		["Home", 0],
		["End", 1],
	])("%s moves 0.5 to %d", (key, target) => {
		expect(sliderKeyTarget(key, 0.5, 0.25)).toBe(target);
	});

	it("stops at the ends of the track", () => {
		expect(sliderKeyTarget("ArrowRight", 0.9, 0.25)).toBe(1);
		expect(sliderKeyTarget("ArrowLeft", 0.1, 0.25)).toBe(0);
	});

	it("leaves every other key alone", () => {
		expect(sliderKeyTarget("Tab", 0.5, 0.25)).toBeNull();
	});
});
