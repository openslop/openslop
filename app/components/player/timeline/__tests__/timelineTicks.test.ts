import { describe, expect, it } from "vitest";
import { buildTicks, tickInterval } from "../timelineTicks";

describe("tickInterval", () => {
	it("picks the finest interval whose labels still fit", () => {
		expect(tickInterval(200)).toBe(1);
		expect(tickInterval(40)).toBe(2);
		expect(tickInterval(10)).toBe(10);
	});

	it("falls back to the coarsest interval when nothing fits", () => {
		expect(tickInterval(0.01)).toBe(600);
	});
});

describe("buildTicks", () => {
	it("runs from zero up to the last whole interval", () => {
		expect(buildTicks(10, 5)).toEqual([0, 5, 10]);
		expect(buildTicks(12, 5)).toEqual([0, 5, 10]);
	});

	it("always emits the zero tick", () => {
		expect(buildTicks(0, 5)).toEqual([0]);
	});
});
