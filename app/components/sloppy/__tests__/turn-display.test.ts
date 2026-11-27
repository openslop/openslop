import { describe, expect, it } from "vitest";
import type { StepPart } from "@/lib/agent/step-runs";
import {
	reasoningOpen,
	runLabel,
	runSeconds,
	workedSeconds,
} from "../turn-display";

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

describe("runLabel", () => {
	it("names the latest step, how many steps ran, and how long they took", () => {
		expect(runLabel([thinking, reading], 11.2)).toBe(
			"Reading script · 2 steps · 12s",
		);
	});

	it("names a run for its latest call, not the thought after it", () => {
		expect(runLabel([reading, thinking])).toBe("Reading script · 2 steps");
	});

	it("counts a single step in the singular", () => {
		expect(runLabel([thinking], 0.4)).toBe("Thinking · 1 step · 1s");
	});

	it("leaves out a time it never recorded and says when a call failed", () => {
		expect(runLabel([reading, failed])).toBe(
			"Reading script · 2 steps · failed",
		);
	});
});

describe("runSeconds", () => {
	const times = {
		startedAt: 0,
		endedAt: 9000,
		runs: [{ startedAt: 1500, endedAt: 4000 }, { startedAt: 6000 }],
	};

	it("counts a run that opens the turn from the turn's start", () => {
		expect(runSeconds(times, 0, true)).toBe(4);
	});

	it("counts a run after a reply from its first step", () => {
		expect(runSeconds(times, 0, false)).toBe(2.5);
	});

	it("ends a run cut off by the end of the turn there", () => {
		expect(runSeconds(times, 1, false)).toBe(3);
	});

	it("has no time for a run it never stamped", () => {
		expect(runSeconds(undefined, 0, true)).toBeUndefined();
	});
});

describe("workedSeconds", () => {
	it("is the turn from start to end", () => {
		expect(workedSeconds({ startedAt: 1000, endedAt: 13_400 })).toBe(12.4);
	});

	it("has no time before the turn has ended", () => {
		expect(workedSeconds({ startedAt: 1000 })).toBeUndefined();
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
