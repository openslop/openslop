import { describe, expect, it } from "vitest";
import { animateImagePrompt, isAnimateImageRequest } from "../animatePrompt";

describe("animateImagePrompt", () => {
	it("names the scene the user is looking at", () => {
		expect(animateImagePrompt(9)).toBe(
			"Animate the image in scene 9, reusing the frame it has already generated.",
		);
	});

	it("says nothing about ids or tool arguments", () => {
		expect(animateImagePrompt(9)).not.toMatch(/deps|still|id=/);
	});

	it("is recognised by the matcher", () => {
		expect(isAnimateImageRequest(animateImagePrompt(1))).toBe(true);
		expect(isAnimateImageRequest(animateImagePrompt(42))).toBe(true);
	});

	it("does not claim an unrelated request", () => {
		expect(isAnimateImageRequest("make scene 3 funnier")).toBe(false);
		expect(isAnimateImageRequest("animate the image")).toBe(false);
	});
});
