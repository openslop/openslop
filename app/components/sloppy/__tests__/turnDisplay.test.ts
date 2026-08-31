import { describe, expect, it } from "vitest";
import { reasoningOpen, turnStatus, type TurnPart } from "../turnDisplay";

const thought: TurnPart = { type: "reasoning", text: "weighing" };
const said: TurnPart = { type: "text", text: "on it" };
const calling: TurnPart = {
	type: "tool-edit_script",
	toolCallId: "c1",
	state: "input-available",
	input: { ops: [] },
};
const called: TurnPart = {
	type: "tool-edit_script",
	toolCallId: "c1",
	state: "output-available",
	input: { ops: [] },
	output: "Applied 1 operation.",
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

	it("keeps working after a tool call, which the editor still has to run", () => {
		expect(turnStatus([said, calling])).toBe("Applying changes");
	});

	it("goes back to slopping once the editor has answered and the model has not", () => {
		expect(turnStatus([said, called])).toBe("Slopping…");
	});
});

describe("reasoningOpen", () => {
	it("opens the thought while it is the newest thing in a live turn", () => {
		expect(reasoningOpen(true, false, "weighing")).toBe(true);
	});

	it("shuts it once Sloppy has moved on", () => {
		expect(reasoningOpen(true, true, "weighing")).toBe(false);
	});

	it("shuts a long thought even while it is the newest thing", () => {
		expect(reasoningOpen(true, false, "x".repeat(601))).toBe(false);
	});

	it("shuts a restored thought the turn was interrupted in the middle of", () => {
		expect(reasoningOpen(false, false, "half a thought")).toBe(false);
	});
});
