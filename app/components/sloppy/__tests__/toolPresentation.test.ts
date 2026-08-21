import { describe, expect, it } from "vitest";
import type { ToolUIPart } from "ai";
import type { SloppyTools } from "@/lib/agent/types";
import { toolPresentation } from "../toolPresentation";

const part = (type: string) =>
	({
		type,
		toolCallId: "c1",
		state: "input-available",
		input: {},
	}) as ToolUIPart<SloppyTools>;

describe("toolPresentation", () => {
	it("names the tool a live call runs", () => {
		expect(toolPresentation(part("tool-read_script")).label).toBe(
			"Reading the script",
		);
	});

	it("still renders a tool a past build wrote into the transcript", () => {
		const presentation = toolPresentation(part("tool-count_words"));

		expect(presentation.label).toBe("count words");
		expect(presentation.icon).toBeDefined();
	});
});
