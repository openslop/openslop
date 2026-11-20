import { describe, expect, it } from "vitest";
import { animateImagePrompt, animateImageScene } from "../animate-prompt";

describe("animateImagePrompt", () => {
	it("reads back the scene it named", () => {
		expect(animateImageScene(animateImagePrompt(1))).toBe(1);
		expect(animateImageScene(animateImagePrompt(42))).toBe(42);
	});

	it("does not claim an unrelated request", () => {
		expect(animateImageScene("make scene 3 funnier")).toBeNull();
		expect(animateImageScene("animate the image")).toBeNull();
	});
});
