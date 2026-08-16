import { describe, expect, it } from "vitest";
import type { AgentMessageRow } from "../types";
import { foldTurns } from "../turns";

const row = (
	id: string,
	message: AgentMessageRow["message"],
	extras: Partial<AgentMessageRow> = {},
): AgentMessageRow => ({
	id,
	message,
	request: null,
	usage: null,
	...extras,
});

const user = (id: string) => row(id, { role: "user", content: "shorter" });

const assistant = (id: string, extras: Partial<AgentMessageRow> = {}) =>
	row(
		id,
		{
			role: "assistant",
			content: [
				{
					type: "tool-call",
					toolCallId: "c1",
					toolName: "edit_script",
					input: {},
				},
			],
		},
		extras,
	);

const toolResult = (id: string) =>
	row(id, {
		role: "tool",
		content: [
			{
				type: "tool-result",
				toolCallId: "c1",
				toolName: "edit_script",
				output: { type: "text", value: "Applied 1 operation." },
			},
		],
	});

describe("foldTurns", () => {
	it("keeps a tool result with the turn that called it", () => {
		const turns = foldTurns([
			user("u1"),
			assistant("a1"),
			toolResult("t1"),
			user("u2"),
			assistant("a2"),
		]);

		expect(turns.map((turn) => turn.messages.length)).toEqual([1, 2, 1, 1]);
		expect(turns[1].id).toBe("a1");
	});

	it("marks whose turn each one is, which is what the panel renders on", () => {
		const turns = foldTurns([user("u1"), assistant("a1"), toolResult("t1")]);

		expect(turns.map((turn) => turn.role)).toEqual(["user", "assistant"]);
	});

	it("reports a stray tool result as its own, rather than as an assistant's", () => {
		const [turn] = foldTurns([toolResult("t1")]);

		expect(turn.role).toBe("tool");
	});

	it("keeps every message, in the order it was recorded", () => {
		const rows = [
			user("u1"),
			assistant("a1"),
			toolResult("t1"),
			user("u2"),
			assistant("a2"),
		];

		const messages = foldTurns(rows).flatMap((turn) => turn.messages);

		expect(messages).toEqual(rows.map((row) => row.message));
	});

	it("carries how the turn was produced from its own row", () => {
		const request = { system: "you are sloppy", model: "claude-opus-5" };
		const usage = { inputTokens: 1, outputTokens: 2, workSeconds: 3 };

		const [turn] = foldTurns([
			assistant("a1", { request, usage }),
			toolResult("t1"),
		]);

		expect(turn.request).toEqual(request);
		expect(turn.usage).toEqual(usage);
	});

	it("opens a turn on an agent row with no prompt before it", () => {
		const turns = foldTurns([assistant("a1"), toolResult("t1")]);

		expect(turns).toHaveLength(1);
		expect(turns[0].messages).toHaveLength(2);
	});

	it("never folds two prompts together", () => {
		const turns = foldTurns([user("u1"), user("u2")]);

		expect(turns).toHaveLength(2);
	});
});
