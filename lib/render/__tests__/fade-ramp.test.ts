import { describe, expect, it } from "vitest";
import { fadeRamp } from "../fade-ramp";

const isStrictlyIncreasing = (values: readonly number[]): boolean =>
	values.slice(1).every((value, index) => value > values[index]);

describe("fadeRamp", () => {
	it("returns a trapezoid when duration comfortably exceeds fade", () => {
		const ramp = fadeRamp(100, 10);
		expect(ramp).toEqual({ input: [0, 10, 90, 100], output: [0, 1, 1, 0] });
		if (!ramp) throw new Error("Expected ramp for long duration");
		expect(isStrictlyIncreasing(ramp.input)).toBe(true);
	});

	it("avoids equal adjacent values when fade*2 would equal duration", () => {
		const ramp = fadeRamp(10, 5);
		expect(ramp).not.toBeNull();
		if (!ramp) throw new Error("Expected ramp for equal fade-duration case");
		expect(isStrictlyIncreasing(ramp.input)).toBe(true);
	});

	it("clamps fade when fadeFrames exceeds half the duration", () => {
		const ramp = fadeRamp(6, 100);
		expect(ramp).not.toBeNull();
		if (!ramp) throw new Error("Expected ramp for clamped fade case");
		expect(isStrictlyIncreasing(ramp.input)).toBe(true);
	});

	it("collapses to a triangle when duration only fits a single-frame fade", () => {
		const ramp = fadeRamp(2, 10);
		expect(ramp).toEqual({ input: [0, 1, 2], output: [0, 1, 0] });
		if (!ramp) throw new Error("Expected ramp for tiny duration case");
		expect(isStrictlyIncreasing(ramp.input)).toBe(true);
	});

	it("returns null when duration is 1 frame or less", () => {
		expect(fadeRamp(1, 5)).toBeNull();
		expect(fadeRamp(0, 5)).toBeNull();
	});

	it("returns null when fadeFrames is zero or negative", () => {
		expect(fadeRamp(100, 0)).toBeNull();
		expect(fadeRamp(100, -5)).toBeNull();
	});

	it("produces strictly increasing input for short durations", () => {
		for (let duration = 2; duration <= 21; duration++) {
			const ramp = fadeRamp(duration, 100);
			if (ramp) expect(isStrictlyIncreasing(ramp.input)).toBe(true);
		}
	});
});
