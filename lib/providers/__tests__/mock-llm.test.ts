import { describe, expect, it } from "vitest";
import { outlinePrompt } from "@/lib/script/prompt/outline";
import { NO_FINDINGS, reviewPrompt } from "@/lib/script/prompt/review";
import { MockLLM } from "../llm/mock";

describe("MockLLM", () => {
	it("answers an outline prompt with an outline, not a script", async () => {
		const { text } = await new MockLLM().generate({
			prompt: outlinePrompt("two friends in a forest", "English"),
		});

		expect(text).toContain("Premise:");
		expect(text).not.toContain("<metadata_title>");
	});

	it("answers a review with no findings, so a mock run ends the loop", async () => {
		const { text } = await new MockLLM().generate({
			prompt: reviewPrompt('<video id="v1">Shot 1: a rabbit.</video>'),
		});

		expect(text).toBe(NO_FINDINGS);
	});

	it("falls back to a script for anything else", async () => {
		const { text } = await new MockLLM().generate({
			prompt: "write me a video",
		});

		expect(text).toContain("<metadata_title>");
	});
});
