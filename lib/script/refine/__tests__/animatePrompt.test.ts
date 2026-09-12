import { describe, expect, it } from "vitest";
import { animateVideoPrompt, animateVideoScene } from "../animatePrompt";

describe("animate prompt", () => {
	it("round-trips the scene it names", () => {
		expect(animateVideoScene(animateVideoPrompt(3))).toBe(3);
	});

	it("is null for any other request", () => {
		expect(animateVideoScene("Make scene 3 funnier")).toBeNull();
	});
});
