import { describe, expect, it } from "vitest";
import { NO_FINDINGS, REVIEW_INSTRUCTION, reviewPrompt } from "../review";

const script = '<narration id="n1">Once upon a time.</narration>';

describe("reviewPrompt", () => {
	it("opens with the instruction, which is how a mock knows its own prompt", () => {
		expect(reviewPrompt(script).startsWith(REVIEW_INSTRUCTION)).toBe(true);
	});

	it("carries the script it judges", () => {
		expect(reviewPrompt(script)).toContain(script);
	});

	it("points at the spec's sections rather than restating their rules", () => {
		const prompt = reviewPrompt(script);

		expect(prompt).toContain(
			"Video and music prompts: every requirement of their sections",
		);
		expect(prompt).not.toContain("Shot 1");
	});

	it("holds the script to its format unless it is auto", () => {
		expect(reviewPrompt(script, "cinematic")).toContain(
			"It was intended as a Cinematic, so judge it accordingly.",
		);
		expect(reviewPrompt(script)).not.toContain("It was intended as a");
	});

	it("opens on one clean sentence whether or not a format is set", () => {
		expect(reviewPrompt(script, "cinematic")).not.toContain("..");
		expect(reviewPrompt(script)).not.toContain(" .");
	});

	it("keeps the reviewer on the scenes and off the assets ahead of them", () => {
		const prompt = reviewPrompt(script);

		expect(prompt).toContain("Judge only the scenes of the script below.");
		expect(prompt).toContain(
			"The asset elements ahead of the first scene are the project's assets, and outside the scope of this review.",
		);
	});

	it("asks for every scene, so a long script is not half reviewed", () => {
		expect(reviewPrompt(script)).toContain("Work through every scene");
	});

	it("allows at most one finding per element, so a clean element can have none", () => {
		const prompt = reviewPrompt(script);

		expect(prompt).toContain("give each element at most one finding");
		expect(prompt).not.toContain("a single finding");
	});

	it("keeps the reviewer off the app's own attributes, which the rules never teach", () => {
		expect(reviewPrompt(script)).toContain(
			"Attributes the rules never mention, like provider, model, volume and trimStart, are app settings and outside the scope of this review.",
		);
	});

	it("asks for findings in one shape, and names the reply that ends the loop", () => {
		expect(reviewPrompt(script)).toContain(
			"- <element id> | <the rule it breaks> | <the smallest change that fixes it>",
		);
		expect(reviewPrompt(script)).toContain(NO_FINDINGS);
	});

	it("shows a worked finding, so the shape is copied rather than guessed", () => {
		expect(reviewPrompt(script)).toContain(
			"- kM2pQ7rT9wXz4bNc | Format: startFrame | ",
		);
	});
});
