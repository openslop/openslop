import { describe, expect, it } from "vitest";
import {
	hasPendingToolCall,
	settleUnansweredCalls,
	toolCallsMade,
	upsertMessage,
	pruneTranscript,
} from "../messages";
import { DRAFTING_TOOLS, SNAPSHOT_TOOLS } from "../tools/registry";
import type { SloppyMessage } from "../types";

const asked: SloppyMessage = {
	id: "m1",
	role: "user",
	parts: [{ type: "text", text: "make it shorter" }],
};

const turn = (
	state: "input-available" | "output-available",
	parts = 1,
): SloppyMessage => ({
	id: "m2",
	role: "assistant",
	metadata: { workSeconds: 3 },
	parts: Array.from({ length: parts }, (_part, index) => ({
		type: "tool-read_script",
		toolCallId: `call-${index}`,
		input: {},
		...(state === "output-available"
			? { state, output: "the script" }
			: { state }),
	})),
});

describe("upsertMessage", () => {
	it("appends a message the transcript has not seen", () => {
		expect(upsertMessage([asked], turn("input-available"))).toEqual([
			asked,
			turn("input-available"),
		]);
	});

	it("replaces the message a later step grew, rather than storing it twice", () => {
		const grown = turn("output-available");
		const messages = upsertMessage([asked, turn("input-available")], grown);

		expect(messages).toEqual([asked, grown]);
	});
});

describe("toolCallsMade", () => {
	it("counts what the turn has spent of its budget", () => {
		expect(toolCallsMade([asked, turn("output-available", 3)])).toBe(3);
	});

	it("is nothing when the turn has only just been asked for", () => {
		expect(toolCallsMade([asked])).toBe(0);
	});
});

describe("hasPendingToolCall", () => {
	it("sees a call the editor has been handed and not answered", () => {
		expect(hasPendingToolCall([asked, turn("input-available")])).toBe(true);
	});

	it("sees none once the editor has answered", () => {
		expect(hasPendingToolCall([asked, turn("output-available")])).toBe(false);
	});

	it("sees only the tools it is asked about", () => {
		const pending = [asked, turn("input-available")];
		expect(hasPendingToolCall(pending, DRAFTING_TOOLS)).toBe(false);
		expect(hasPendingToolCall(pending, SNAPSHOT_TOOLS)).toBe(true);
	});
});

describe("settleUnansweredCalls", () => {
	it("settles a call the editor never answered, so nothing waits on it", () => {
		const settled = settleUnansweredCalls([asked, turn("input-available")]);

		expect(settled).toEqual([
			asked,
			{
				...turn("input-available"),
				parts: [
					{
						type: "tool-read_script",
						toolCallId: "call-0",
						input: {},
						state: "output-error",
						errorText: "Stopped before the editor ran it",
					},
				],
			},
		]);
		expect(hasPendingToolCall(settled)).toBe(false);
	});

	it("settles a call with the given reason when the user stops the turn", () => {
		const settled = settleUnansweredCalls(
			[asked, turn("input-available")],
			"Stopped by you before the editor finished it",
		);

		expect(settled.at(-1)?.parts).toEqual([
			{
				type: "tool-read_script",
				toolCallId: "call-0",
				input: {},
				state: "output-error",
				errorText: "Stopped by you before the editor finished it",
			},
		]);
		expect(hasPendingToolCall(settled)).toBe(false);
	});

	it("leaves answered calls and what the user said alone", () => {
		const transcript = [asked, turn("output-available")];

		expect(settleUnansweredCalls(transcript)).toEqual(transcript);
	});
});

describe("pruneTranscript", () => {
	const read = (toolCallId: string, output: string) =>
		({
			type: "tool-read_script",
			toolCallId,
			state: "output-available",
			input: {},
			output,
		}) as const;

	const edit: SloppyMessage["parts"][number] = {
		type: "tool-edit_script",
		toolCallId: "e1",
		state: "output-available",
		input: { ops: [{ op: "remove", id: "n1" }] },
		output: "Applied 1 operation.",
	};

	const thought = (text: string) =>
		({
			type: "reasoning",
			text,
			providerMetadata: { anthropic: { signature: `sig-${text}` } },
		}) as const;

	const turnWith = (id: string, ...parts: SloppyMessage["parts"]) =>
		({ id, role: "assistant", parts }) as SloppyMessage;

	it("keeps every reading the turn in flight has taken", () => {
		const inFlight = turnWith(
			"m2",
			read("a", "was"),
			edit,
			read("b", "stands"),
		);

		expect(pruneTranscript([asked, inFlight])).toEqual([asked, inFlight]);
	});

	it("keeps the reasoning of the turn in flight, which is signed with its calls", () => {
		const inFlight = turnWith("m2", thought("first"), read("a", "was"), edit);

		expect(pruneTranscript([asked, inFlight])).toEqual([asked, inFlight]);
	});

	it("drops the readings of a turn that has finished", () => {
		const finished = turnWith("m2", read("a", "was"), edit);

		expect(pruneTranscript([asked, finished, asked])).toEqual([
			asked,
			turnWith("m2", edit),
			asked,
		]);
	});

	it("drops the reasoning of a finished turn, whose signature the dropped reading breaks", () => {
		const finished = turnWith(
			"m2",
			thought("first"),
			read("a", "was"),
			thought("second"),
			edit,
		);

		expect(pruneTranscript([asked, finished, asked])).toEqual([
			asked,
			turnWith("m2", edit),
			asked,
		]);
	});

	it("leaves what the user said alone", () => {
		expect(pruneTranscript([asked])).toEqual([asked]);
	});
});
