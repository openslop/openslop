import { describe, expect, it } from "vitest";
import { arrowPointerDelta, clampResize } from "../use-resize";

describe("clampResize", () => {
	it("expands vertically when the pointer moves down", () => {
		expect(clampResize("vertical", 50, 200, 50, 500)).toBe(250);
	});

	it("expands horizontally when the pointer moves left", () => {
		expect(clampResize("horizontal", -50, 200, 50, 500)).toBe(250);
	});

	it("clamps to minSize", () => {
		expect(clampResize("vertical", -100, 50, 50, 500)).toBe(50);
	});

	it("clamps to maxSize", () => {
		expect(clampResize("vertical", 10_000, 100, 50, 500)).toBe(500);
	});

	it("grows against the pointer when the handle is on the leading edge", () => {
		expect(clampResize("vertical", -100, 200, 100, 600, true)).toBe(300);
		expect(clampResize("vertical", 100, 200, 100, 600, true)).toBe(100);
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
