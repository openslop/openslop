import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
	LanguageModelV3CallOptions,
	LanguageModelV3StreamPart,
} from "@ai-sdk/provider";
import { MockLanguageModelV3, simulateReadableStream } from "ai/test";
import type { LLMModelName } from "@/lib/connectors/llm/openslop/models";
import type { SloppyMessage } from "@/lib/agent/types";

const { conversations, provider } = vi.hoisted(() => ({
	conversations: {
		findOrCreateConversation: vi.fn(
			async (_projectId: string, _userId: string) => "conv-1",
		),
		listConversationMessages: vi.fn(
			async (_id: string): Promise<unknown[]> => [],
		),
		saveConversationMessage: vi.fn(
			async (_id: string, _message: unknown) => {},
		),
	},
	provider: { agentModel: vi.fn() },
}));

vi.mock("../conversations", () => conversations);
vi.mock("../providers", () => ({ getLLMProvider: () => provider }));

import { streamAgentTurn } from "../agentTurn";

const USAGE = {
	inputTokens: { total: 12, noCache: 12, cacheRead: 0, cacheWrite: 0 },
	outputTokens: { total: 7, text: 7, reasoning: 0 },
};

const finish: LanguageModelV3StreamPart = {
	type: "finish",
	finishReason: { unified: "stop", raw: "end_turn" },
	usage: USAGE,
};

const TEXT_TURN: LanguageModelV3StreamPart[] = [
	{ type: "stream-start", warnings: [] },
	{ type: "text-start", id: "t0" },
	{ type: "text-delta", id: "t0", delta: "on it" },
	{ type: "text-end", id: "t0" },
	finish,
];

const asked = (text: string): SloppyMessage => ({
	id: `m-user-${text}`,
	role: "user",
	parts: [{ type: "text", text }],
});

// The SDK frames its own stream, and closes it with a [DONE] that is not JSON.
async function chunksOf(response: Response) {
	const body = await response.text();
	return body
		.split("\n\n")
		.flatMap((frame) => (frame.startsWith("data: ") ? [frame.slice(6)] : []))
		.filter((data) => data !== "[DONE]")
		.map(
			(data) => JSON.parse(data) as { type: string } & Record<string, unknown>,
		);
}

let calls: LanguageModelV3CallOptions[] = [];

async function runTurn(
	chunks: LanguageModelV3StreamPart[],
	options: {
		message?: SloppyMessage;
		model?: LLMModelName;
		history?: SloppyMessage[];
	} = {},
) {
	if (options.history) {
		conversations.listConversationMessages.mockResolvedValue(options.history);
	}
	provider.agentModel.mockReturnValue({
		model: new MockLanguageModelV3({
			doStream: async (call) => {
				calls.push(call);
				return {
					stream: simulateReadableStream({ chunks, chunkDelayInMs: 0 }),
				};
			},
		}),
		modelId: "test-model",
		providerOptions: {},
	});

	const response = await streamAgentTurn({
		projectId: "p1",
		userId: "u1",
		message: options.message ?? asked("make it shorter"),
		model: options.model,
	});
	return chunksOf(response);
}

const finishSeconds = (chunks: Record<string, unknown>[]) => {
	const metadata = chunks.at(-1)?.messageMetadata as { workSeconds: number };
	return metadata.workSeconds;
};

const saved = (call: number) =>
	conversations.saveConversationMessage.mock.calls[call][1] as SloppyMessage;

beforeEach(() => {
	vi.clearAllMocks();
	calls = [];
	conversations.listConversationMessages.mockResolvedValue([]);
});

describe("streamAgentTurn", () => {
	it("records what came in before asking the model", async () => {
		await runTurn(TEXT_TURN);

		expect(saved(0)).toMatchObject({
			role: "user",
			parts: [{ type: "text", text: "make it shorter" }],
		});
	});

	it("streams the reply and finishes", async () => {
		const chunks = await runTurn(TEXT_TURN);

		expect(chunks).toContainEqual(
			expect.objectContaining({ type: "text-delta", delta: "on it" }),
		);
		expect(chunks.at(-1)).toMatchObject({ type: "finish" });
	});

	it("stores the assistant message the step produced", async () => {
		await runTurn(TEXT_TURN);

		expect(saved(1)).toMatchObject({
			role: "assistant",
			parts: [{ type: "step-start" }, { type: "text", text: "on it" }],
		});
	});

	// A call answered with an error is what sends the model back round to retry.
	it("hands a call it could not read back as that call's own failure", async () => {
		const chunks = await runTurn([
			{ type: "stream-start", warnings: [] },
			{
				type: "tool-call",
				toolCallId: "call-1",
				toolName: "set_metadata",
				input: '{"title": <parameter name="title">Moon Cat}',
			},
			{ ...finish, finishReason: { unified: "tool-calls", raw: "tool_use" } },
		]);

		expect(chunks).toContainEqual(
			expect.objectContaining({
				type: "tool-input-error",
				toolCallId: "call-1",
				toolName: "set_metadata",
			}),
		);
		expect(chunks.map((chunk) => chunk.type)).not.toContain("error");
	});

	it("surfaces a tool call for the editor to run", async () => {
		const chunks = await runTurn([
			{ type: "stream-start", warnings: [] },
			{
				type: "tool-call",
				toolCallId: "call-1",
				toolName: "edit_script",
				input: JSON.stringify({ ops: [{ op: "remove", id: "n1" }] }),
			},
			{ ...finish, finishReason: { unified: "tool-calls", raw: "tool_use" } },
		]);

		expect(chunks).toContainEqual(
			expect.objectContaining({
				type: "tool-input-available",
				toolCallId: "call-1",
				toolName: "edit_script",
				input: { ops: [{ op: "remove", id: "n1" }] },
			}),
		);
	});
});

describe("a turn that takes more than one step", () => {
	const reading = (toolCallId: string, output: string) =>
		({
			type: "tool-read_script",
			toolCallId,
			state: "output-available",
			input: {},
			output,
		}) as const;

	/** What the editor sends back: the same message, carrying no metadata of its own. */
	const answered = (...parts: SloppyMessage["parts"]): SloppyMessage => ({
		id: "m-agent",
		role: "assistant",
		parts,
	});

	/** What the server stored for the steps before this one. */
	const recorded = (
		metadata: SloppyMessage["metadata"],
		...parts: SloppyMessage["parts"]
	): SloppyMessage[] => [
		asked("make it shorter"),
		{ id: "m-agent", role: "assistant", metadata, parts },
	];

	const spent = { workSeconds: 3 };

	it("adds a step's time to what the turn already worked", async () => {
		const chunks = await runTurn(TEXT_TURN, {
			message: answered(reading("call-1", "the script")),
			history: recorded(spent, reading("call-1", "the script")),
		});

		expect(finishSeconds(chunks)).toBeGreaterThanOrEqual(3);
	});

	it("runs the model the step was sent with", async () => {
		await runTurn(TEXT_TURN, {
			message: answered(reading("call-1", "the script")),
			history: recorded(spent, reading("call-1", "the script")),
			model: "Slop LLM v1",
		});

		expect(provider.agentModel).toHaveBeenCalledWith("claude-opus-5");
	});

	it("does not take what a turn cost from the editor", async () => {
		const claimed: SloppyMessage = {
			...answered(reading("call-1", "the script")),
			metadata: { workSeconds: 9999 },
		};
		const chunks = await runTurn(TEXT_TURN, {
			message: claimed,
			history: recorded(spent, reading("call-1", "the script")),
		});

		expect(finishSeconds(chunks)).toBeLessThan(9999);
	});

	it("keeps every tool on offer for the rest of the turn", async () => {
		await runTurn(TEXT_TURN, {
			message: answered(reading("call-1", "the script")),
		});

		const offered = calls[0].tools?.map((tool) => tool.name);
		expect(offered).toContain("read_script");
		expect(offered).toContain("write_script");
	});

	it("keeps offering the tools while the turn is within its budget", async () => {
		await runTurn(TEXT_TURN, {
			message: answered(reading("call-1", "the script")),
		});

		expect(calls[0].toolChoice).toEqual({ type: "auto" });
	});

	it("withdraws the tools once the turn has spent its budget", async () => {
		await runTurn(TEXT_TURN, {
			message: answered(
				...Array.from({ length: 30 }, (_part, index) =>
					reading(`call-${index}`, "the script"),
				),
			),
		});

		expect(calls[0].toolChoice).toEqual({ type: "none" });
	});

	it("keeps every reading the turn in flight has taken", async () => {
		await runTurn(TEXT_TURN, {
			message: answered(
				{ type: "step-start" },
				reading("call-1", "the script as it was"),
				{ type: "step-start" },
				reading("call-2", "the script as it stands"),
			),
		});

		const sent = JSON.stringify(calls[0].prompt);
		expect(sent).toContain("the script as it was");
		expect(sent).toContain("the script as it stands");
	});

	it("drops the readings of turns that have already finished", async () => {
		await runTurn(TEXT_TURN, {
			message: asked("now make it longer"),
			history: recorded(spent, reading("call-1", "a script from last turn")),
		});

		expect(JSON.stringify(calls[0].prompt)).not.toContain(
			"a script from last turn",
		);
	});
});

describe("model selection", () => {
	it("runs the picked model, resolved to what the provider takes", async () => {
		await runTurn(TEXT_TURN, { model: "Slop LLM v1" });

		expect(provider.agentModel).toHaveBeenCalledWith("claude-opus-5");
	});

	it("leaves the provider on its own default when nothing was picked", async () => {
		await runTurn(TEXT_TURN);

		expect(provider.agentModel).toHaveBeenCalledWith(undefined);
	});
});
