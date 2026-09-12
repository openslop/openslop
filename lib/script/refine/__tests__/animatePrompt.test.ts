import { describe, expect, it } from "vitest";
import { animateClipPrompt, animateClipScene } from "../animatePrompt";

describe("animate prompt", () => {
	it("round-trips the scene it names", () => {
		expect(animateClipScene(animateClipPrompt(3))).toBe(3);
	});

	it("is null for any other request", () => {
		expect(animateClipScene("Make scene 3 funnier")).toBeNull();
	});
});
