import { describe, expect, it } from "vitest";
import { audioVolume } from "../audioVolume";

describe("audioVolume", () => {
	it("returns the scalar multiplier when no fade is needed", () => {
		expect(audioVolume(0.5, 100, 0)).toBe(0.5);
		expect(audioVolume(1, 1, 10)).toBe(1);
		expect(audioVolume(0.3, 0, 10)).toBe(0.3);
	});

	it("returns a function when a fade ramp is produced", () => {
		const v = audioVolume(1, 100, 10);
		expect(typeof v).toBe("function");
	});

	it("applies fade-in and fade-out around the multiplier", () => {
		const multiplier = 0.8;
		const v = audioVolume(multiplier, 100, 10);
		if (typeof v !== "function") throw new Error("Expected function");
		expect(v(0)).toBeCloseTo(0);
		expect(v(10)).toBeCloseTo(multiplier);
		expect(v(50)).toBeCloseTo(multiplier);
		expect(v(90)).toBeCloseTo(multiplier);
		expect(v(100)).toBeCloseTo(0);
		expect(v(5)).toBeCloseTo(multiplier * 0.5);
		expect(v(95)).toBeCloseTo(multiplier * 0.5);
	});

	it("clamps outside the ramp range", () => {
		const v = audioVolume(1, 100, 10);
		if (typeof v !== "function") throw new Error("Expected function");
		expect(v(-50)).toBeCloseTo(0);
		expect(v(1000)).toBeCloseTo(0);
	});

	it("scales the envelope linearly with the multiplier", () => {
		const a = audioVolume(1, 100, 10);
		const b = audioVolume(0.25, 100, 10);
		if (typeof a !== "function" || typeof b !== "function") {
			throw new Error("Expected functions");
		}
		for (const f of [0, 5, 10, 50, 90, 95, 100]) {
			expect(b(f)).toBeCloseTo(a(f) * 0.25);
		}
	});

	it("handles a zero multiplier by staying silent across the envelope", () => {
		const v = audioVolume(0, 100, 10);
		if (typeof v !== "function") throw new Error("Expected function");
		for (const f of [0, 10, 50, 90, 100]) {
			expect(v(f)).toBe(0);
		}
	});

	it("collapses to a triangle envelope when fade overlaps the duration", () => {
		const multiplier = 1;
		const v = audioVolume(multiplier, 2, 100);
		if (typeof v !== "function") throw new Error("Expected function");
		expect(v(0)).toBeCloseTo(0);
		expect(v(1)).toBeCloseTo(multiplier);
		expect(v(2)).toBeCloseTo(0);
		expect(v(0.5)).toBeCloseTo(multiplier * 0.5);
		expect(v(1.5)).toBeCloseTo(multiplier * 0.5);
	});

	it("returns the multiplier when fadeFrames is negative", () => {
		expect(audioVolume(0.7, 100, -5)).toBe(0.7);
	});
});
