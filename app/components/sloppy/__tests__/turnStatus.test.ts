import { describe, expect, it } from "vitest";
import type { AgentContentPart } from "@/lib/agent/types";
import { turnStatus } from "../turnStatus";

const thought: AgentContentPart = { type: "reasoning", text: "weighing" };
const said: AgentContentPart = { type: "text", text: "on it" };
const called: AgentContentPart = {
	type: "tool-call",
	toolCallId: "c1",
	toolName: "edit_script",
	input: { ops: [] },
};

describe("turnStatus", () => {
	it("reads as thinking before anything has streamed", () => {
		expect(turnStatus([])).toBe("Thinking");
	});

	it("reads as thinking while only thoughts have streamed", () => {
		expect(turnStatus([thought])).toBe("Thinking");
	});

	it("reads as responding once text follows the thought", () => {
		expect(turnStatus([thought, said])).toBe("Responding");
	});

	it("keeps working after a tool call, which the client still has to run", () => {
		expect(turnStatus([said, called])).toBe("Applying changes");
	});
});
