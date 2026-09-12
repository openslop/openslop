import { describe, expect, it } from "vitest";
import { fadeRamp } from "../fadeRamp";

function isStrictlyIncreasing(arr: readonly number[]): boolean {
	for (let i = 1; i < arr.length; i++) {
		if (arr[i] <= arr[i - 1]) return false;
	}
	return true;
}

describe("fadeRamp", () => {
	it("returns a trapezoid when duration comfortably exceeds fade", () => {
		const r = fadeRamp(100, 10);
		expect(r).toEqual({ input: [0, 10, 90, 100], output: [0, 1, 1, 0] });
		if (!r) throw new Error("Expected ramp for long duration");
		expect(isStrictlyIncreasing(r.input)).toBe(true);
	});

	it("avoids equal adjacent values when fade*2 would equal duration", () => {
		const r = fadeRamp(10, 5);
		expect(r).not.toBeNull();
		if (!r) throw new Error("Expected ramp for equal fade-duration case");
		expect(isStrictlyIncreasing(r.input)).toBe(true);
	});

	it("clamps fade when fadeFrames exceeds half the duration", () => {
		const r = fadeRamp(6, 100);
		expect(r).not.toBeNull();
		if (!r) throw new Error("Expected ramp for clamped fade case");
		expect(isStrictlyIncreasing(r.input)).toBe(true);
	});

	it("collapses to a triangle when duration only fits a single-frame fade", () => {
		const r = fadeRamp(2, 10);
		expect(r).toEqual({ input: [0, 1, 2], output: [0, 1, 0] });
		if (!r) throw new Error("Expected ramp for tiny duration case");
		expect(isStrictlyIncreasing(r.input)).toBe(true);
	});

	it("returns null when duration is 1 frame or less", () => {
		expect(fadeRamp(1, 5)).toBeNull();
		expect(fadeRamp(0, 5)).toBeNull();
	});

	it("returns null when fadeFrames is zero or negative", () => {
		expect(fadeRamp(100, 0)).toBeNull();
		expect(fadeRamp(100, -5)).toBeNull();
	});

	it("produces strictly increasing input for short even durations", () => {
		for (let d = 2; d <= 20; d++) {
			const r = fadeRamp(d, 100);
			if (r) expect(isStrictlyIncreasing(r.input)).toBe(true);
		}
	});

	it("produces strictly increasing input for short odd durations", () => {
		for (let d = 3; d <= 21; d += 2) {
			const r = fadeRamp(d, 100);
			if (r) expect(isStrictlyIncreasing(r.input)).toBe(true);
		}
	});
});
