import { describe, expect, it } from "vitest";
import {
	formatRangeDuration,
	formatTime,
	formatTimeRange,
} from "../timestamps";

describe("formatTime", () => {
	it("formats seconds as m:ss", () => {
		expect(formatTime(0)).toBe("0:00");
		expect(formatTime(14)).toBe("0:14");
		expect(formatTime(75)).toBe("1:15");
		expect(formatTime(3599)).toBe("59:59");
	});

	it("clamps negative values to zero", () => {
		expect(formatTime(-1)).toBe("0:00");
	});

	it("floors fractional seconds", () => {
		expect(formatTime(14.9)).toBe("0:14");
	});
});

describe("formatTimeRange", () => {
	it("joins start and end with an en-dash", () => {
		expect(formatTimeRange(0, 14)).toBe("0:00–0:14");
		expect(formatTimeRange(60, 65)).toBe("1:00–2:05");
	});
});

describe("formatRangeDuration", () => {
	it("equals the length of the floored start–end range", () => {
		expect(formatRangeDuration(0, 14)).toBe("14s");
		expect(formatRangeDuration(60, 65)).toBe("65s");
	});

	// Regression for #426: the badge must match the range, not round(duration).
	it("stays consistent with the range on non-integer input", () => {
		// round(duration) would show 13s while the range reads 0:00–0:12.
		expect(formatTimeRange(0, 12.6)).toBe("0:00–0:12");
		expect(formatRangeDuration(0, 12.6)).toBe("12s");

		// Independent flooring of both endpoints: range reads 0:05–0:09 (4s),
		// while round(duration) would show 3s.
		expect(formatTimeRange(5.6, 3.4)).toBe("0:05–0:09");
		expect(formatRangeDuration(5.6, 3.4)).toBe("4s");
	});

	it("clamps negatives to zero", () => {
		expect(formatRangeDuration(-1, 0)).toBe("0s");
	});
});
