import { describe, expect, it } from "vitest";
import { clampResize } from "../useResize";

describe("clampResize", () => {
	it("expands vertically when cursor moves down", () => {
		expect(clampResize("vertical", 100, 150, 200, 50, 500)).toBe(250);
	});

	it("expands horizontally when cursor moves left (delta = start - current)", () => {
		expect(clampResize("horizontal", 200, 150, 200, 50, 500)).toBe(250);
	});

	it("clamps to minSize", () => {
		expect(clampResize("vertical", 100, 0, 50, 50, 500)).toBe(50);
	});

	it("clamps to maxSize", () => {
		expect(clampResize("vertical", 0, 10_000, 100, 50, 500)).toBe(500);
	});

	it("grows against the pointer when the handle is on the leading edge", () => {
		expect(clampResize("vertical", 500, 400, 200, 100, 600, true)).toBe(300);
		expect(clampResize("vertical", 500, 600, 200, 100, 600, true)).toBe(100);
	});
});
