import { beforeEach, describe, expect, it, vi } from "vitest";
import type { LanguageModelV3StreamPart } from "@ai-sdk/provider";
import { MockLanguageModelV3, simulateReadableStream } from "ai/test";
import type { AgentMessage, AgentStreamPart } from "@/lib/agent/types";
import type { LLMModelName } from "@/lib/connectors/llm/openslop/models";

const { conversations, provider } = vi.hoisted(() => ({
	conversations: {
		findOrCreateConversation: vi.fn(
			async (_projectId: string, _userId: string) => "conv-1",
		),
		listConversationMessages: vi.fn(async (_id: string) => []),
		appendConversationMessages: vi.fn(
			async (
				_id: string,
				_messages: unknown[],
				_extras?: {
					request?: { system: string; model: string };
					usage?: unknown;
				},
			) => [],
		),
		abandonedToolResults: vi.fn(() => []),
	},
	provider: { agentModel: vi.fn() },
}));

vi.mock("../conversations", () => conversations);
vi.mock("../providers", () => ({ getLLMProvider: () => provider }));

import { runAgentTurn } from "../agentTurn";

const USAGE = {
	inputTokens: { total: 12, noCache: 12, cacheRead: 0, cacheWrite: 0 },
	outputTokens: { total: 7, text: 7, reasoning: 0 },
};

const finish: LanguageModelV3StreamPart = {
	type: "finish",
	finishReason: { unified: "stop", raw: "end_turn" },
	usage: USAGE,
};

async function runTurn(
	chunks: LanguageModelV3StreamPart[],
	model?: LLMModelName,
) {
	provider.agentModel.mockReturnValue({
		model: new MockLanguageModelV3({
			doStream: async () => ({
				stream: simulateReadableStream({ chunks, chunkDelayInMs: 0 }),
			}),
		}),
		modelId: "test-model",
		providerOptions: {},
	});

	const parts: AgentStreamPart[] = [];
	for await (const part of runAgentTurn({
		projectId: "p1",
		userId: "u1",
		message: "make it shorter",
		script: "<narration>hi</narration>",
		model,
	})) {
		parts.push(part);
	}
	return parts;
}

const appended = (call: number) =>
	conversations.appendConversationMessages.mock.calls[
		call
	][1] as AgentMessage[];

const extrasOf = (call: number) =>
	conversations.appendConversationMessages.mock.calls[call][2];

describe("runAgentTurn", () => {
	beforeEach(() => vi.clearAllMocks());

	it("records the user's message before asking the model", async () => {
		await runTurn([
			{ type: "stream-start", warnings: [] },
			{ type: "text-start", id: "t0" },
			{ type: "text-delta", id: "t0", delta: "on it" },
			{ type: "text-end", id: "t0" },
			finish,
		]);

		expect(appended(0)).toEqual([{ role: "user", content: "make it shorter" }]);
	});

	it("streams thoughts and text, then finishes with usage", async () => {
		const parts = await runTurn([
			{ type: "stream-start", warnings: [] },
			{ type: "reasoning-start", id: "r0" },
			{ type: "reasoning-delta", id: "r0", delta: "weighing" },
			{ type: "reasoning-end", id: "r0" },
			{ type: "text-start", id: "t0" },
			{ type: "text-delta", id: "t0", delta: "on it" },
			{ type: "text-end", id: "t0" },
			finish,
		]);

		expect(parts).toMatchObject([
			{ type: "request", request: { model: "test-model" } },
			{ type: "reasoning-delta", text: "weighing" },
			{ type: "reasoning-end", seconds: expect.any(Number) },
			{ type: "text-delta", text: "on it" },
			{ type: "finish", usage: { inputTokens: 12, outputTokens: 7 } },
		]);
	});

	it("records the thinking time it streamed, so a stored turn keeps its label", async () => {
		const parts = await runTurn([
			{ type: "stream-start", warnings: [] },
			{ type: "reasoning-start", id: "r0" },
			{ type: "reasoning-delta", id: "r0", delta: "weighing" },
			{ type: "reasoning-end", id: "r0" },
			{ type: "text-start", id: "t0" },
			{ type: "text-delta", id: "t0", delta: "on it" },
			{ type: "text-end", id: "t0" },
			finish,
		]);

		const [seconds] = parts.flatMap((part) =>
			part.type === "reasoning-end" ? [part.seconds] : [],
		);
		expect(extrasOf(1)).toMatchObject({ usage: { thoughtSeconds: seconds } });
	});

	it("leaves thinking time unset when the model reports none", async () => {
		await runTurn([
			{ type: "stream-start", warnings: [] },
			{ type: "text-start", id: "t0" },
			{ type: "text-delta", id: "t0", delta: "on it" },
			{ type: "text-end", id: "t0" },
			finish,
		]);

		expect(extrasOf(1)).toMatchObject({ usage: { thoughtSeconds: undefined } });
	});

	it("surfaces a tool call and persists the turn that produced it", async () => {
		const parts = await runTurn([
			{ type: "stream-start", warnings: [] },
			{
				type: "tool-call",
				toolCallId: "call-1",
				toolName: "edit_script",
				input: JSON.stringify({ ops: [{ op: "remove", id: "n1" }] }),
			},
			{ ...finish, finishReason: { unified: "tool-calls", raw: "tool_use" } },
		]);

		expect(parts).toContainEqual(
			expect.objectContaining({
				type: "tool-call",
				toolCallId: "call-1",
				toolName: "edit_script",
				input: { ops: [{ op: "remove", id: "n1" }] },
			}),
		);

		expect(appended(1)[0]).toMatchObject({
			role: "assistant",
			content: [{ type: "tool-call", toolName: "edit_script" }],
		});
		const extras = extrasOf(1);
		expect(extras?.request?.model).toBe("test-model");
		expect(extras?.request?.system).toContain("<narration>hi</narration>");
		expect(extras?.usage).toMatchObject({ inputTokens: 12, outputTokens: 7 });
	});

	it("reports a provider error as a part rather than throwing", async () => {
		const parts = await runTurn([
			{ type: "stream-start", warnings: [] },
			{ type: "error", error: new Error("model unavailable") },
			finish,
		]);

		expect(parts).toContainEqual({
			type: "error",
			message: "model unavailable",
		});
	});
});

describe("model selection", () => {
	const textTurn: LanguageModelV3StreamPart[] = [
		{ type: "stream-start", warnings: [] },
		{ type: "text-start", id: "t0" },
		{ type: "text-delta", id: "t0", delta: "on it" },
		{ type: "text-end", id: "t0" },
		finish,
	];

	it("runs the picked model, resolved to what the provider takes", async () => {
		await runTurn(textTurn, "Slop LLM v1");

		expect(provider.agentModel).toHaveBeenCalledWith("claude-opus-5");
	});

	it("leaves the provider on its own default when nothing was picked", async () => {
		await runTurn(textTurn);

		expect(provider.agentModel).toHaveBeenCalledWith(undefined);
	});
});
