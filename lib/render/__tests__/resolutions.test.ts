import { describe, expect, it } from "vitest";
import { renderScale } from "../resolutions";

describe("renderScale", () => {
	it("renders 1080p at the composition's own size", () => {
		expect(renderScale("1080p")).toBe(1);
	});

	it("doubles for 4K and shrinks below 1 for 480p", () => {
		expect(renderScale("4K")).toBe(2);
		expect(renderScale("480p")).toBeLessThan(1);
	});
});
