import { describe, expect, it } from "vitest";
import { formatDuration, formatTime, formatTimeRange } from "../timestamps";

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

describe("formatDuration", () => {
	it("rounds to integer seconds", () => {
		expect(formatDuration(14)).toBe("14s");
		expect(formatDuration(6.7)).toBe("7s");
		expect(formatDuration(6.3)).toBe("6s");
	});

	it("clamps negatives to zero", () => {
		expect(formatDuration(-1)).toBe("0s");
	});
});
