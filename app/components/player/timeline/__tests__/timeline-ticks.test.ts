import { describe, expect, it } from "vitest";
import { buildTicks, tickInterval, tickLabel } from "../timeline-ticks";

describe("tickInterval", () => {
	it("picks the finest interval whose labels still fit", () => {
		expect(tickInterval(2000)).toBe(0.05);
		expect(tickInterval(200)).toBe(0.5);
		expect(tickInterval(100)).toBe(1);
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

	it("keeps the end tick when the duration is an exact fractional multiple", () => {
		expect(buildTicks(20.4, 0.2).at(-1)).toBe(20.4);
	});

	it("lands sub-second ticks on exact hundredths", () => {
		expect(buildTicks(0.35, 0.05)).toEqual([
			0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35,
		]);
	});
});

describe("tickLabel", () => {
	it("shows whole seconds at one-second intervals and up", () => {
		expect(tickLabel(65, 5)).toBe("1:05");
	});

	it("shows the decimals a sub-second interval needs", () => {
		expect(tickLabel(1.5, 0.5)).toBe("0:01.5");
		expect(tickLabel(2.3, 0.1)).toBe("0:02.3");
		expect(tickLabel(59.95, 0.05)).toBe("0:59.95");
		expect(tickLabel(3, 0.01)).toBe("0:03.00");
	});
});
