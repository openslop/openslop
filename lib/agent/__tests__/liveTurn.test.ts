import { describe, expect, it } from "vitest";
import { emptyTurn, reduceTurn, toolCallsIn } from "../liveTurn";
import type { AgentStreamPart } from "../types";

const fold = (...parts: AgentStreamPart[]) =>
	parts.reduce(reduceTurn, emptyTurn("make it shorter"));

describe("reduceTurn", () => {
	it("grows one part per run of deltas, so text and reasoning stay separate", () => {
		const turn = fold(
			{ type: "reasoning-delta", text: "thin" },
			{ type: "reasoning-delta", text: "king" },
			{ type: "text-delta", text: "on " },
			{ type: "text-delta", text: "it" },
		);

		expect(turn.parts).toEqual([
			{ type: "reasoning", text: "thinking" },
			{ type: "text", text: "on it" },
		]);
	});

	it("keeps deltas that resume after a tool call out of the earlier part", () => {
		const turn = fold(
			{ type: "text-delta", text: "shortening" },
			{
				type: "tool-call",
				toolCallId: "c1",
				toolName: "edit_script",
				input: {},
			},
			{ type: "text-delta", text: "done" },
		);

		expect(turn.parts.map((part) => part.type)).toEqual([
			"text",
			"tool-call",
			"text",
		]);
	});

	it("records the request and the time spent thinking", () => {
		const request = { system: "be sloppy", model: "opus" };
		const turn = fold(
			{ type: "request", request },
			{ type: "reasoning-end", seconds: 4 },
		);

		expect(turn.request).toEqual(request);
		expect(turn.thoughtSeconds).toBe(4);
	});

	it("returns the same turn for a part the panel does not render", () => {
		const turn = emptyTurn("make it shorter");

		expect(
			reduceTurn(turn, {
				type: "finish",
				usage: { inputTokens: 1, outputTokens: 2 },
			}),
		).toBe(turn);
	});
});

describe("toolCallsIn", () => {
	it("collects the calls the client has to run, in order", () => {
		const turn = fold(
			{
				type: "tool-call",
				toolCallId: "c1",
				toolName: "edit_script",
				input: {},
			},
			{ type: "text-delta", text: "and now" },
			{
				type: "tool-call",
				toolCallId: "c2",
				toolName: "write_script",
				input: { brief: "a new story" },
			},
		);

		expect(toolCallsIn(turn).map((call) => call.toolCallId)).toEqual([
			"c1",
			"c2",
		]);
	});
});
