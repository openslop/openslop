import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { relativeTime } from "../relativeTime";

describe("relativeTime", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-06-12T12:00:00Z"));
	});
	afterEach(() => {
		vi.useRealTimers();
	});

	const ago = (ms: number) => new Date(Date.now() - ms).toISOString();

	it('returns "now" under a minute', () => {
		expect(relativeTime(ago(30_000))).toBe("now");
	});

	it("returns minutes, hours, and days", () => {
		expect(relativeTime(ago(5 * 60_000))).toBe("5m ago");
		expect(relativeTime(ago(3 * 3_600_000))).toBe("3h ago");
		expect(relativeTime(ago(10 * 86_400_000))).toBe("10d ago");
	});

	it("falls back to a fixed en-US/UTC date past 30 days", () => {
		// 31 days before the mocked now (2026-06-12) lands on 2026-05-12 UTC.
		expect(relativeTime("2026-05-12T12:00:00Z")).toBe("5/12/2026");
	});

	it("formats the >30d date independent of the process timezone/locale", () => {
		// Pinned to en-US + UTC, so the late-evening UTC instant never shifts day.
		expect(relativeTime("2026-04-01T22:30:00Z")).toBe("4/1/2026");
	});
});
