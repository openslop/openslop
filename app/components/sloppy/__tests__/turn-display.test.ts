import { describe, expect, it } from "vitest";
import type { StepPart } from "@/lib/agent/step-runs";
import { reasoningOpen, stepsLabel } from "../turn-display";

const thinking: StepPart = {
	type: "reasoning",
	text: "weighing",
	state: "done",
};
const reading: StepPart = {
	type: "tool-read_script",
	toolCallId: "c1",
	state: "output-available",
	input: {},
	output: "the script",
};
const failed: StepPart = {
	type: "tool-read_script",
	toolCallId: "c2",
	state: "output-error",
	input: {},
	errorText: "no script yet",
};

describe("stepsLabel", () => {
	it("names the latest step, how many steps ran, and how long they took", () => {
		expect(stepsLabel([thinking, reading], 11.2)).toBe(
			"Reading the script · 2 steps · 12s",
		);
	});

	it("counts a single step in the singular", () => {
		expect(stepsLabel([thinking], 0.4)).toBe("Thinking · 1 step · 1s");
	});

	it("leaves out a time it never recorded and says when a call failed", () => {
		expect(stepsLabel([reading, failed])).toBe(
			"Reading the script · 2 steps · failed",
		);
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
