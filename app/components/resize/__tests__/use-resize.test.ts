import { describe, expect, it } from "vitest";
import { arrowPointerDelta, clampResize } from "../use-resize";

describe("clampResize", () => {
	it("grows with the pointer when the handle is on the end edge", () => {
		expect(clampResize("end", 50, 200, 50, 500)).toBe(250);
	});

	it("grows against the pointer when the handle is on the start edge", () => {
		expect(clampResize("start", -50, 200, 50, 500)).toBe(250);
		expect(clampResize("start", 100, 200, 100, 600)).toBe(100);
	});

	it("clamps to minSize", () => {
		expect(clampResize("end", -100, 50, 50, 500)).toBe(50);
	});

	it("clamps to maxSize", () => {
		expect(clampResize("end", 10_000, 100, 50, 500)).toBe(500);
	});
});

describe("arrowPointerDelta", () => {
	it("moves down or right on the forward arrow", () => {
		expect(arrowPointerDelta("vertical", "ArrowDown")).toBe(16);
		expect(arrowPointerDelta("horizontal", "ArrowRight")).toBe(16);
	});

	it("moves up or left on the back arrow", () => {
		expect(arrowPointerDelta("vertical", "ArrowUp")).toBe(-16);
		expect(arrowPointerDelta("horizontal", "ArrowLeft")).toBe(-16);
	});

	it("ignores the other axis and every other key", () => {
		expect(arrowPointerDelta("vertical", "ArrowLeft")).toBeNull();
		expect(arrowPointerDelta("horizontal", "ArrowUp")).toBeNull();
		expect(arrowPointerDelta("vertical", "Enter")).toBeNull();
	});
});
