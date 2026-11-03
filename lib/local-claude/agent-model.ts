import { randomUUID } from "node:crypto";
import type {
	LanguageModelV3,
	LanguageModelV3CallOptions,
	LanguageModelV3StreamPart,
} from "@ai-sdk/provider";
import { z } from "zod";
import type { AgentModel } from "@/lib/providers/llm/agent-model";
import { generateWithClaude } from "./generate";

const Reply = z.object({
	text: z.string(),
	calls: z.array(z.object({ name: z.string(), input: z.string() })),
});
const usage = {
	inputTokens: {
		total: undefined,
		noCache: undefined,
		cacheRead: undefined,
		cacheWrite: undefined,
	},
	outputTokens: { total: undefined, text: undefined, reasoning: undefined },
};

export function claudeAgentModel(
	userId: string,
	signal?: AbortSignal,
): AgentModel {
	const generate = async (options: LanguageModelV3CallOptions) => {
		const tools =
			options.toolChoice?.type === "none" ? [] : (options.tools ?? []);
		const reply = Reply.parse(
			JSON.parse(
				await generateWithClaude(
					userId,
					JSON.stringify({ messages: options.prompt, tools }),
					"Continue the supplied conversation as the assistant, following its system instructions. Return text and any requested tool calls. Tools are executed by the caller, not by you. Each call input must be a JSON-encoded object matching the named tool's inputSchema. Only call supplied tools. When no tools are provided, calls must be empty.",
					signal && options.abortSignal
						? AbortSignal.any([signal, options.abortSignal])
						: (signal ?? options.abortSignal),
					z.toJSONSchema(Reply),
				),
			),
		);
		for (const call of reply.calls) {
			if (
				!tools.some(
					(tool) => tool.type === "function" && tool.name === call.name,
				)
			)
				throw new Error("Claude requested an unavailable tool.");
			JSON.parse(call.input);
		}
		return {
			content: [
				...(reply.text ? [{ type: "text" as const, text: reply.text }] : []),
				...reply.calls.map((call) => ({
					type: "tool-call" as const,
					toolCallId: randomUUID(),
					toolName: call.name,
					input: call.input,
				})),
			],
			finishReason: {
				unified: reply.calls.length
					? ("tool-calls" as const)
					: ("stop" as const),
				raw: undefined,
			},
			usage,
			warnings: [],
		};
	};
	const model: LanguageModelV3 = {
		specificationVersion: "v3",
		provider: "claude-code",
		modelId: "sonnet",
		supportedUrls: {},
		doGenerate: generate,
		doStream: async (options) => {
			const result = await generate(options);
			return {
				stream: new ReadableStream<LanguageModelV3StreamPart>({
					start(controller) {
						controller.enqueue({ type: "stream-start", warnings: [] });
						for (const item of result.content) {
							if (item.type === "tool-call") controller.enqueue(item);
							else {
								controller.enqueue({ type: "text-start", id: "text" });
								controller.enqueue({
									type: "text-delta",
									id: "text",
									delta: item.text,
								});
								controller.enqueue({ type: "text-end", id: "text" });
							}
						}
						controller.enqueue({
							type: "finish",
							finishReason: result.finishReason,
							usage,
						});
						controller.close();
					},
				}),
			};
		},
	};
	return {
		model,
		modelId: "sonnet",
		providerOptions: {},
		cachedPrefix: {},
		costOf: () => 0,
	};
}
