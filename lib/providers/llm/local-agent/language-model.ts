import { randomUUID } from "node:crypto";
import type {
	LanguageModelV3,
	LanguageModelV3CallOptions,
	LanguageModelV3FinishReason,
	LanguageModelV3FunctionTool,
	LanguageModelV3StreamPart,
} from "@ai-sdk/provider";
import type { StopReason } from "@agentclientprotocol/sdk";
import { LOCAL_PROVIDER } from "@/lib/connectors/provider-catalog";
import { promptAgent } from "./prompt";
import { transcript } from "./transcript";

const CONTINUE = "Continue this conversation as the assistant.";
const ACT_THROUGH_TOOLS =
	"Act on the project only through the openslop tools, never your own tools or files.";

const FINISH_REASONS: Record<
	StopReason,
	LanguageModelV3FinishReason["unified"]
> = {
	end_turn: "stop",
	max_tokens: "length",
	max_turn_requests: "length",
	refusal: "content-filter",
	cancelled: "other",
};

const UNKNOWN_USAGE = {
	inputTokens: {
		total: undefined,
		noCache: undefined,
		cacheRead: undefined,
		cacheWrite: undefined,
	},
	outputTokens: { total: undefined, text: undefined, reasoning: undefined },
};

function promptFor({
	prompt,
	tools = [],
	toolChoice,
}: LanguageModelV3CallOptions) {
	const offered =
		toolChoice?.type === "none"
			? []
			: tools.filter(
					(tool): tool is LanguageModelV3FunctionTool =>
						tool.type === "function",
				);
	const lead =
		offered.length > 0 ? `${CONTINUE} ${ACT_THROUGH_TOOLS}` : CONTINUE;
	return { text: `${lead}\n\n${transcript(prompt)}`, tools: offered };
}

/** Text and thoughts each stream as a block, and a new block starts whenever the agent switches between them. */
async function* parts(
	command: string,
	options: LanguageModelV3CallOptions,
): AsyncGenerator<LanguageModelV3StreamPart> {
	yield { type: "stream-start", warnings: [] };
	const { text, tools } = promptFor(options);
	let open: { type: "text" | "reasoning"; id: string } | undefined;
	let finishReason: LanguageModelV3FinishReason = {
		unified: "other",
		raw: undefined,
	};
	for await (const event of promptAgent(command, text, tools)) {
		if (open && open.type !== event.type) {
			yield { type: `${open.type}-end`, id: open.id };
			open = undefined;
		}
		switch (event.type) {
			case "text":
			case "reasoning":
				if (!open) {
					open = { type: event.type, id: randomUUID() };
					yield { type: `${open.type}-start`, id: open.id };
				}
				yield { type: `${open.type}-delta`, id: open.id, delta: event.delta };
				break;
			case "tool-call":
				yield {
					type: "tool-call",
					toolCallId: randomUUID(),
					toolName: event.toolName,
					input: JSON.stringify(event.input),
				};
				finishReason = { unified: "tool-calls", raw: undefined };
				break;
			case "stop":
				finishReason = {
					unified: FINISH_REASONS[event.stopReason],
					raw: event.stopReason,
				};
		}
	}
	yield { type: "finish", finishReason, usage: UNKNOWN_USAGE };
}

const readable = <T>(parts: AsyncGenerator<T>) =>
	new ReadableStream<T>({
		async pull(controller) {
			const { value, done } = await parts.next();
			if (done) controller.close();
			else controller.enqueue(value);
		},
		async cancel() {
			await parts.return(undefined);
		},
	});

/** An agent installed on this computer, reached over ACP by the command that starts it. */
export function localAgentModel(command: string): LanguageModelV3 {
	return {
		specificationVersion: "v3",
		provider: LOCAL_PROVIDER,
		modelId: command,
		supportedUrls: {},
		doGenerate: () => {
			throw new Error("Local agents only stream.");
		},
		doStream: async (options) => ({
			stream: readable(parts(command, options)),
		}),
	};
}
