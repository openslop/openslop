import {
	convertToModelMessages,
	createUIMessageStreamResponse,
	pruneMessages,
	streamText,
	toUIMessageStream,
} from "ai";
import { nanoid } from "nanoid";
import { z } from "zod";
import { stringifyError } from "@/lib/errors";
import { sloppyInstructions } from "@/lib/agent/prompt";
import {
	toolCallsMade,
	upsertMessage,
	pruneTranscript,
} from "@/lib/agent/messages";
import { SLOPPY_TOOLS } from "@/lib/agent/tools/registry";
import type { SloppyMessage } from "@/lib/agent/types";
import type { ModelRef } from "@/lib/connectors/types";
import type { LLMProvider } from "@/lib/providers/llm/base";
import {
	findOrCreateConversation,
	listConversationMessages,
	saveConversationMessage,
} from "./conversations";
import { logger } from "./logger";

const MAX_TOOL_CALLS = 30;

export const agentTurnSchema = <TModel extends ModelRef>(
	model: z.ZodType<TModel>,
) =>
	z
		.object({
			projectId: z.uuid(),
			message: z.unknown(),
		})
		.and(model);

export type AgentTurnRequest = {
	projectId: string;
	userId: string;
	message: SloppyMessage;
	model: string;
	llm: () => Promise<LLMProvider>;
};

/**
 * One step of a turn: the model runs until it calls a tool, and the editor comes
 * back with the result as the next request. The round trip is the loop.
 */
export async function streamAgentTurn(
	request: AgentTurnRequest,
): Promise<Response> {
	// Reading the key this turn runs on depends on nothing else here, and would
	// otherwise sit in front of the first token.
	const [llm, conversationId] = await Promise.all([
		request.llm(),
		findOrCreateConversation(request.projectId, request.userId),
	]);
	const history = await listConversationMessages(conversationId);
	const stored = history.find((row) => row.id === request.message.id);
	const incoming: SloppyMessage = {
		...request.message,
		metadata: stored?.metadata,
	};
	const messages = upsertMessage(history, incoming);
	await saveConversationMessage(conversationId, incoming);

	const carried = stored?.metadata?.workSeconds ?? 0;
	const { model, providerOptions, cachedPrefix } = llm.agentModel(
		request.model,
	);

	const modelMessages = pruneMessages({
		messages: await convertToModelMessages(pruneTranscript(messages), {
			tools: SLOPPY_TOOLS,
			ignoreIncompleteToolCalls: true,
		}),
	});

	const startedAt = Date.now();
	const result = streamText({
		model,
		instructions: sloppyInstructions(cachedPrefix),
		messages: modelMessages,
		tools: SLOPPY_TOOLS,
		// Withdrawing the tools is what ends a runaway turn: the model has nothing
		// left to call, so it answers the user instead of looping again.
		toolChoice: toolCallsMade(messages) >= MAX_TOOL_CALLS ? "none" : "auto",
		providerOptions,
		onFinish: ({ usage }) => logger.info({ usage }, "Sloppy turn usage"),
	});

	return createUIMessageStreamResponse({
		stream: toUIMessageStream<typeof SLOPPY_TOOLS, SloppyMessage>({
			stream: result.stream,
			tools: SLOPPY_TOOLS,
			originalMessages: messages,
			generateMessageId: nanoid,
			messageMetadata: ({ part }) => {
				if (part.type === "finish") {
					return {
						workSeconds: carried + Math.round((Date.now() - startedAt) / 1000),
					};
				}
			},
			onEnd: ({ responseMessage }) =>
				saveConversationMessage(conversationId, responseMessage),
			onError: (error) => {
				logger.error(error, "Sloppy turn");
				return stringifyError(error);
			},
		}),
	});
}
