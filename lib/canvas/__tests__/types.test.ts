import { describe, expect, it } from "vitest";
import { DURATION_MAX, snapDurationUp } from "../types";

describe("snapDurationUp", () => {
	it("takes the shortest option that still covers the seconds asked for", () => {
		expect(snapDurationUp(4)).toBe(4);
		expect(snapDurationUp(4.1)).toBe(5);
	});

	it("holds the longest option rather than inventing one", () => {
		expect(snapDurationUp(DURATION_MAX + 10)).toBe(DURATION_MAX);
	});

	it("holds the shortest option for anything under it", () => {
		expect(snapDurationUp(0)).toBe(4);
	});
});
