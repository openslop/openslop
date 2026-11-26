import { describe, expect, it } from "vitest";
import {
	dbToGain,
	gainToDb,
	gainToPosition,
	positionToGain,
	TAPER_RANGE_DB,
} from "../gain-taper";

describe("positionToGain", () => {
	it("is unity gain at the top and silent at the bottom", () => {
		expect(positionToGain(1)).toBe(1);
		expect(positionToGain(0)).toBe(0);
	});

	it("drops the same number of decibels for every tenth", () => {
		for (let step = 1; step < 10; step++) {
			const louder = positionToGain((step + 1) / 10);
			const quieter = positionToGain(step / 10);
			expect(gainToDb(louder) - gainToDb(quieter)).toBeCloseTo(
				TAPER_RANGE_DB / 10,
			);
		}
	});

	it("clamps positions outside 0–1", () => {
		expect(positionToGain(-0.5)).toBe(0);
		expect(positionToGain(1.5)).toBe(1);
	});
});

describe("gainToDb", () => {
	it("inverts dbToGain", () => {
		for (const db of [-30, -6, 0, 6]) {
			expect(gainToDb(dbToGain(db))).toBeCloseTo(db);
		}
	});
});

describe("gainToPosition", () => {
	it("round-trips positionToGain", () => {
		for (const position of [0, 0.05, 0.1, 0.37, 0.5, 0.9, 1]) {
			expect(gainToPosition(positionToGain(position))).toBeCloseTo(position);
		}
	});

	it("pins gains quieter than the bottom step to 0 and above unity to 1", () => {
		expect(gainToPosition(1e-6)).toBe(0);
		expect(gainToPosition(2)).toBe(1);
	});
});
