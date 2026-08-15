import { describe, expect, it } from "vitest";
import { agentMessageSchema, pendingToolCalls } from "../types";
import type { AgentMessage } from "../types";

const call = (toolCallId: string): AgentMessage => ({
	role: "assistant",
	content: [
		{ type: "tool-call", toolCallId, toolName: "edit_script", input: {} },
	],
});

const result = (toolCallId: string): AgentMessage => ({
	role: "tool",
	content: [
		{
			type: "tool-result",
			toolCallId,
			toolName: "edit_script",
			output: { type: "text", value: "done" },
		},
	],
});

describe("pendingToolCalls", () => {
	it("finds a call the editor never answered", () => {
		const pending = pendingToolCalls([call("a"), result("a"), call("b")]);
		expect(pending.map((p) => p.toolCallId)).toEqual(["b"]);
	});

	it("is empty when every call was settled", () => {
		expect(pendingToolCalls([call("a"), result("a")])).toEqual([]);
	});

	it("ignores plain text turns", () => {
		expect(
			pendingToolCalls([{ role: "user", content: "make it shorter" }]),
		).toEqual([]);
	});
});

describe("agentMessageSchema", () => {
	it("accepts a turn stored exactly as the model layer takes it", () => {
		expect(agentMessageSchema.safeParse(result("a")).success).toBe(true);
	});

	it("rejects a role the model layer does not know", () => {
		expect(
			agentMessageSchema.safeParse({ role: "agent", content: "hi" }).success,
		).toBe(false);
	});
});
