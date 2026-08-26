import { describe, expect, it } from "vitest";
import { animateImagePrompt, animateImageScene } from "../animatePrompt";

describe("animateImagePrompt", () => {
	it("names the scene the user is looking at", () => {
		expect(animateImagePrompt(9)).toBe(
			"Animate the image in scene 9, reusing the frame it has already generated.",
		);
	});

	it("says nothing about ids or tool arguments", () => {
		expect(animateImagePrompt(9)).not.toMatch(/deps|still|id=/);
	});

	it("reads back the scene it named", () => {
		expect(animateImageScene(animateImagePrompt(1))).toBe(1);
		expect(animateImageScene(animateImagePrompt(42))).toBe(42);
	});

	it("does not claim an unrelated request", () => {
		expect(animateImageScene("make scene 3 funnier")).toBeNull();
		expect(animateImageScene("animate the image")).toBeNull();
	});
});
