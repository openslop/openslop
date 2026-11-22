import { describe, expect, it } from "vitest";
import { audioVolume } from "../audio-volume";

describe("audioVolume", () => {
	it("returns the scalar multiplier when no fade is needed", () => {
		expect(audioVolume(0.5, 100, 0)).toBe(0.5);
		expect(audioVolume(1, 1, 10)).toBe(1);
		expect(audioVolume(0.3, 0, 10)).toBe(0.3);
	});

	it("applies fade-in and fade-out around the multiplier", () => {
		const multiplier = 0.8;
		const volume = audioVolume(multiplier, 100, 10);
		if (typeof volume !== "function") throw new Error("Expected function");
		expect(volume(0)).toBeCloseTo(0);
		expect(volume(10)).toBeCloseTo(multiplier);
		expect(volume(50)).toBeCloseTo(multiplier);
		expect(volume(90)).toBeCloseTo(multiplier);
		expect(volume(100)).toBeCloseTo(0);
		expect(volume(5)).toBeCloseTo(multiplier * 0.5);
		expect(volume(95)).toBeCloseTo(multiplier * 0.5);
	});

	it("clamps outside the ramp range", () => {
		const volume = audioVolume(1, 100, 10);
		if (typeof volume !== "function") throw new Error("Expected function");
		expect(volume(-50)).toBeCloseTo(0);
		expect(volume(1000)).toBeCloseTo(0);
	});

	it("scales the envelope linearly with the multiplier", () => {
		const full = audioVolume(1, 100, 10);
		const quarter = audioVolume(0.25, 100, 10);
		if (typeof full !== "function" || typeof quarter !== "function") {
			throw new Error("Expected functions");
		}
		for (const frame of [0, 5, 10, 50, 90, 95, 100]) {
			expect(quarter(frame)).toBeCloseTo(full(frame) * 0.25);
		}
	});

	it("handles a zero multiplier by staying silent across the envelope", () => {
		const volume = audioVolume(0, 100, 10);
		if (typeof volume !== "function") throw new Error("Expected function");
		for (const frame of [0, 10, 50, 90, 100]) {
			expect(volume(frame)).toBe(0);
		}
	});

	it("collapses to a triangle envelope when fade overlaps the duration", () => {
		const multiplier = 1;
		const volume = audioVolume(multiplier, 2, 100);
		if (typeof volume !== "function") throw new Error("Expected function");
		expect(volume(0)).toBeCloseTo(0);
		expect(volume(1)).toBeCloseTo(multiplier);
		expect(volume(2)).toBeCloseTo(0);
		expect(volume(0.5)).toBeCloseTo(multiplier * 0.5);
		expect(volume(1.5)).toBeCloseTo(multiplier * 0.5);
	});

	it("returns the multiplier when fadeFrames is negative", () => {
		expect(audioVolume(0.7, 100, -5)).toBe(0.7);
	});
});
