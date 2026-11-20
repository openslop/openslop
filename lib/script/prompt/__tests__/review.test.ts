import { describe, expect, it } from "vitest";
import { NO_FINDINGS, REVIEW_INSTRUCTION, reviewPrompt } from "../review";

const script = '<speech id="n1">Once upon a time.</speech>';

describe("reviewPrompt", () => {
	it("opens with the instruction, which is how a mock knows its own prompt", () => {
		expect(reviewPrompt(script).startsWith(REVIEW_INSTRUCTION)).toBe(true);
	});

	it("carries the script it judges", () => {
		expect(reviewPrompt(script)).toContain(script);
	});

	it("names the reply that ends the review loop", () => {
		expect(reviewPrompt(script)).toContain(NO_FINDINGS);
	});

	it("holds the script to its format unless it is auto", () => {
		expect(reviewPrompt(script, "cinematic")).toContain(
			"It was intended as a Cinematic, so judge it accordingly.",
		);
		expect(reviewPrompt(script)).not.toContain("It was intended as a");
	});
});
