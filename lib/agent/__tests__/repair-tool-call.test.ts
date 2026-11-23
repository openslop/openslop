import { describe, expect, it } from "vitest";
import { generateText, tool } from "ai";
import { MockLanguageModelV3 } from "ai/test";
import { z } from "zod";
import { repairToolCall } from "../repair-tool-call";

const OPS = `{"ops":[{"op":"set","id":"xgarXI0GnDmEdJ2E","attrs":{"duration":"15","motion":"handheldDrift"},"text":"Shot 1: distant seagulls."}]}`;
const WITH_STRAY_BRACE = OPS.replace('"}]}', '"}}]}');

const tools = {
	edit_script: tool({
		inputSchema: z.object({
			ops: z.array(
				z.object({
					op: z.literal("set"),
					id: z.string(),
					attrs: z.record(z.string(), z.string()),
					text: z.string(),
				}),
			),
		}),
	}),
};

const callWith = (input: string, repair = repairToolCall) =>
	generateText({
		model: new MockLanguageModelV3({
			doGenerate: async () => ({
				content: [
					{
						type: "tool-call",
						toolCallId: "call-1",
						toolName: "edit_script",
						input,
					},
				],
				finishReason: { unified: "tool-calls", raw: "tool_use" },
				usage: {
					inputTokens: { total: 1, noCache: 1, cacheRead: 0, cacheWrite: 0 },
					outputTokens: { total: 1, text: 1, reasoning: 0 },
				},
				warnings: [],
			}),
		}),
		tools,
		repairToolCall: repair,
		prompt: "edit",
	});

describe("repairToolCall", () => {
	it("the reported payload is not valid JSON before repair", () => {
		expect(() => JSON.parse(WITH_STRAY_BRACE)).toThrow();
	});

	it("runs a call whose input has one stray closing brace", async () => {
		const { toolCalls } = await callWith(WITH_STRAY_BRACE);

		expect(toolCalls).toHaveLength(1);
		expect(toolCalls[0]).toMatchObject({
			toolName: "edit_script",
			input: JSON.parse(OPS),
		});
		expect(toolCalls[0]).not.toHaveProperty("invalid");
	});

	it("leaves a call that parses but fails the schema invalid", async () => {
		const { toolCalls } = await callWith('{"ops":[{"op":"remove"}]}');

		expect(toolCalls[0]).toMatchObject({ invalid: true });
	});

	it("does not complete a call that was cut off", async () => {
		const { toolCalls } = await callWith(OPS.slice(0, -3));

		expect(toolCalls[0]).toMatchObject({ invalid: true });
	});
});
