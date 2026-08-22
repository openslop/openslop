import { describe, expect, it } from "vitest";
import { outlinePrompt } from "@/lib/script/prompt/outline";
import { MockLLM } from "../llm/mock";

describe("MockLLM", () => {
	it("answers an outline prompt with an outline, not a script", async () => {
		const { text } = await new MockLLM().generate({
			prompt: outlinePrompt("two friends in a forest", "English"),
		});

		expect(text).toContain("Premise:");
		expect(text).not.toContain("<metadata_title>");
	});

	it("falls back to a script for anything else", async () => {
		const { text } = await new MockLLM().generate({
			prompt: "write me a video",
		});

		expect(text).toContain("<metadata_title>");
	});
});
