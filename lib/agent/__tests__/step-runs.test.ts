import { describe, expect, it } from "vitest";
import { stepClock, turnBlocks, type TurnPart } from "../step-runs";
import type { SloppyMessage } from "../types";

const thought: TurnPart = {
	type: "reasoning",
	text: "weighing",
	state: "done",
};
const said: TurnPart = { type: "text", text: "on it", state: "done" };
const read: TurnPart = {
	type: "tool-read_script",
	toolCallId: "c1",
	state: "output-available",
	input: {},
	output: "the script",
};

const asked: SloppyMessage = {
	id: "u1",
	role: "user",
	parts: [{ type: "text", text: "make it shorter" }],
};

const answering = (
	stepSeconds: number[],
	...parts: TurnPart[]
): SloppyMessage => ({
	id: "a1",
	role: "assistant",
	metadata: { stepSeconds },
	parts,
});

describe("turnBlocks", () => {
	it("folds each run of steps between replies into one block", () => {
		const blocks = turnBlocks([thought, read, said, read, said]);

		expect(blocks.map((block) => block.kind)).toEqual([
			"steps",
			"reply",
			"steps",
			"reply",
		]);
		expect(blocks[0]).toMatchObject({ run: 0, steps: [thought, read] });
		expect(blocks[2]).toMatchObject({ run: 1, steps: [read] });
	});

	it("keeps back-to-back replies apart", () => {
		expect(turnBlocks([said, said]).map((block) => block.kind)).toEqual([
			"reply",
			"reply",
		]);
	});

	it("does not split a run on a part that renders nothing", () => {
		const blocks = turnBlocks([read, { type: "step-start" }, thought]);

		expect(blocks).toHaveLength(1);
		expect(blocks[0]).toMatchObject({ steps: [read, thought] });
	});
});

describe("stepClock", () => {
	it("times a run from its first step to the reply that ends it", () => {
		const clock = stepClock(asked, 0);

		expect(clock.onPart("reasoning-start", 100)).toBeUndefined();
		expect(clock.onPart("tool-input-start", 300)).toBeUndefined();
		expect(clock.onPart("text-start", 1100)).toEqual([1]);
		expect(clock.onPart("finish", 2000)).toEqual([1]);
	});

	it("starts a new run for steps after a reply", () => {
		const clock = stepClock(asked, 0);

		clock.onPart("tool-input-start", 0);
		clock.onPart("text-start", 500);
		clock.onPart("tool-input-start", 1000);

		expect(clock.onPart("finish", 1200)).toEqual([0.5, 0.2]);
	});

	it("adds the next request to the run the editor was answering", () => {
		const clock = stepClock(answering([0.5], thought, read), 10_000);

		expect(clock.onPart("text-start", 10_300)).toEqual([0.8]);
	});

	it("starts a new run when the last request ended on a reply", () => {
		const clock = stepClock(answering([0.5], read, said), 10_000);

		clock.onPart("tool-call", 10_100);

		expect(clock.onPart("finish", 10_400)).toEqual([0.5, 0.3]);
	});

	it("records no run for a turn that only replies", () => {
		const clock = stepClock(asked, 0);

		expect(clock.onPart("text-start", 100)).toEqual([]);
		expect(clock.onPart("finish", 200)).toEqual([]);
	});
});
