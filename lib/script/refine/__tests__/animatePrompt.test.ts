import { describe, expect, it } from "vitest";
import { animateVideoPrompt, animateVideoScene } from "../animatePrompt";

describe("animate prompt", () => {
	it("round-trips the scene it names, with a picture to open on or without", () => {
		expect(animateVideoScene(animateVideoPrompt(3, "https://img/f.png"))).toBe(
			3,
		);
		expect(animateVideoScene(animateVideoPrompt(3))).toBe(3);
	});

	it("only claims a frame to continue from when there is one", () => {
		expect(animateVideoPrompt(1, "https://img/f.png")).toContain(
			"the picture it already shows",
		);
		expect(animateVideoPrompt(1)).not.toContain("the picture it already shows");
	});

	it("is null for any other request", () => {
		expect(animateVideoScene("Make scene 3 funnier")).toBeNull();
	});
});
