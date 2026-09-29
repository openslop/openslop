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
			"Video prompts: every requirement of that section",
		);
		expect(prompt).not.toContain("Shot 1");
	});

	it("holds the script to its format only when one is named", () => {
		expect(reviewPrompt(script, "Cinematic")).toContain(
			"It was intended as a Cinematic, so judge it accordingly.",
		);
		expect(reviewPrompt(script)).not.toContain("It was intended as a");
	});

	it("opens on one clean sentence whether or not a format is named", () => {
		expect(reviewPrompt(script, "Cinematic")).not.toContain("..");
		expect(reviewPrompt(script)).not.toContain(" .");
	});

	it("keeps the reviewer off metadata, which is a project setting and never a tag", () => {
		const prompt = reviewPrompt(script);

		expect(prompt).toContain(
			"Metadata elements are outside the scope of this review",
		);
		expect(prompt).not.toContain("Metadata tags,");
	});

	it("asks for every scene, so a long script is not half reviewed", () => {
		expect(reviewPrompt(script)).toContain("Work through every scene");
	});

	it("asks for findings in one shape, and names the reply that ends the loop", () => {
		expect(reviewPrompt(script)).toContain(
			"- <element id> | <the rule it breaks> | <the smallest change that fixes it>",
		);
		expect(reviewPrompt(script)).toContain(NO_FINDINGS);
	});

	it("shows a worked finding, so the shape is copied rather than guessed", () => {
		expect(reviewPrompt(script)).toContain(
			"- kM2pQ7rT9wXz4bNc | Format: trimToDialogue | ",
		);
	});
});
