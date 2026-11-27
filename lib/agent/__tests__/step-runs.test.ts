import { describe, expect, it } from "vitest";
import { turnBlocks, turnClock, type TurnPart } from "../step-runs";
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
	metadata: SloppyMessage["metadata"],
	...parts: TurnPart[]
): SloppyMessage => ({ id: "a1", role: "assistant", metadata, parts });

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

describe("turnClock", () => {
	it("times the first run from the start of the turn, as the working status shows it", () => {
		const clock = turnClock(asked, 0);

		expect(clock.onPart("reasoning-start", 100)).toBeUndefined();
		expect(clock.onPart("tool-input-start", 300)).toBeUndefined();
		expect(clock.onPart("text-start", 1100)).toMatchObject({
			stepSeconds: [1.1],
			runStartedAt: null,
		});
	});

	it("starts a new run for steps after a reply", () => {
		const clock = turnClock(asked, 0);

		clock.onPart("tool-input-start", 0);
		clock.onPart("text-start", 500);
		clock.onPart("tool-input-start", 1000);

		expect(clock.onPart("finish", 1200)).toMatchObject({
			stepSeconds: [0.5, 0.2],
			runStartedAt: 1000,
		});
	});

	it("carries a run the editor was answering on from when it started", () => {
		const clock = turnClock(
			answering({ stepSeconds: [0.5], runStartedAt: 9000 }, thought, read),
			10_000,
		);

		expect(clock.onPart("text-start", 10_300)).toMatchObject({
			stepSeconds: [1.3],
		});
	});

	it("starts a new run when the last request ended on a reply", () => {
		const clock = turnClock(
			answering({ stepSeconds: [0.5], runStartedAt: null }, read, said),
			10_000,
		);

		clock.onPart("tool-call", 10_100);

		expect(clock.onPart("finish", 10_400)).toMatchObject({
			stepSeconds: [0.5, 0.3],
		});
	});

	it("times the whole turn from when it began", () => {
		const clock = turnClock(
			answering({ startedAt: 4000, stepSeconds: [] }, said),
			10_000,
		);

		expect(clock.onPart("finish", 10_400)).toMatchObject({
			startedAt: 4000,
			workSeconds: 6,
		});
	});

	it("records no run for a turn that only replies", () => {
		const clock = turnClock(asked, 0);

		expect(clock.onPart("text-start", 100)).toMatchObject({ stepSeconds: [] });
	});
});
