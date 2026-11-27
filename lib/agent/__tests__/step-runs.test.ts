import { describe, expect, it } from "vitest";
import { turnBlocks, turnTimer, type TurnPart } from "../step-runs";
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
			"run",
			"reply",
			"run",
			"reply",
		]);
		expect(blocks[0]).toMatchObject({ index: 0, steps: [thought, read] });
		expect(blocks[2]).toMatchObject({ index: 1, steps: [read] });
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

describe("turnTimer", () => {
	it("stamps a run's start at its first step and its end at the reply", () => {
		const timer = turnTimer(asked, 0);

		expect(timer.onPart("reasoning-start", 100)).toBeUndefined();
		expect(timer.onPart("tool-input-start", 300)).toBeUndefined();
		expect(timer.onPart("text-start", 1100)).toMatchObject({
			runs: [{ startedAt: 100, endedAt: 1100 }],
		});
	});

	it("sends a run's start only once something ends after it", () => {
		const timer = turnTimer(
			answering({ startedAt: 0, endedAt: 5000, runs: [] }, said),
			6000,
		);

		expect(timer.onPart("tool-input-start", 7000)).toBeUndefined();
		expect(timer.onPart("finish", 8000)).toMatchObject({
			endedAt: 8000,
			runs: [{ startedAt: 7000 }],
		});
	});

	it("starts a new run for steps after a reply", () => {
		const timer = turnTimer(asked, 0);

		timer.onPart("tool-input-start", 0);
		timer.onPart("text-start", 500);
		timer.onPart("tool-input-start", 1000);

		expect(timer.onPart("finish", 1200)).toEqual({
			startedAt: 0,
			endedAt: 1200,
			runs: [{ startedAt: 0, endedAt: 500 }, { startedAt: 1000 }],
		});
	});

	it("keeps the run the editor was answering open across requests", () => {
		const timer = turnTimer(
			answering({ startedAt: 0, runs: [{ startedAt: 9000 }] }, thought, read),
			10_000,
		);

		timer.onPart("tool-call", 10_100);

		expect(timer.onPart("text-start", 10_300)).toMatchObject({
			startedAt: 0,
			runs: [{ startedAt: 9000, endedAt: 10_300 }],
		});
	});

	it("stamps the turn's start once, when it opens", () => {
		expect(turnTimer(asked, 4000).onPart("finish", 6000)).toEqual({
			startedAt: 4000,
			endedAt: 6000,
			runs: [],
		});
	});

	it("stamps nothing for a reply with no run to close", () => {
		expect(turnTimer(asked, 0).onPart("text-start", 100)).toBeUndefined();
	});
});
