import { describe, expect, it } from "vitest";
import type { AgentContentPart } from "@/lib/agent/types";
import { thoughtOpen, turnStatus } from "../turnDisplay";

const thought: AgentContentPart = { type: "reasoning", text: "weighing" };
const said: AgentContentPart = { type: "text", text: "on it" };
const called: AgentContentPart = {
	type: "tool-call",
	toolCallId: "c1",
	toolName: "edit_script",
	input: { ops: [] },
};

describe("turnStatus", () => {
	it("reads as slopping before anything has streamed", () => {
		expect(turnStatus([])).toBe("Slopping…");
	});

	it("reads as slopping while only thoughts have streamed", () => {
		expect(turnStatus([thought])).toBe("Slopping…");
	});

	it("reads as responding once text follows the thought", () => {
		expect(turnStatus([thought, said])).toBe("Responding");
	});

	it("keeps working after a tool call, which the client still has to run", () => {
		expect(turnStatus([said, called])).toBe("Applying changes");
	});
});

describe("thoughtOpen", () => {
	it("opens the thought while it is the newest thing in the turn", () => {
		expect(thoughtOpen(false, "weighing")).toBe(true);
	});

	it("shuts it once Sloppy has moved on", () => {
		expect(thoughtOpen(true, "weighing")).toBe(false);
	});

	it("shuts a long thought even while it is the newest thing", () => {
		expect(thoughtOpen(false, "x".repeat(601))).toBe(false);
	});
});
