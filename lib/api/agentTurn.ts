import {
	convertToModelMessages,
	createUIMessageStreamResponse,
	pruneMessages,
	streamText,
	toUIMessageStream,
} from "ai";
import { nanoid } from "nanoid";
import { stringifyError } from "@/lib/errors";
import { sloppyInstructions } from "@/lib/agent/prompt";
import type { AgentContext } from "@/lib/agent/context";
import {
	toolCallsMade,
	upsertMessage,
	pruneTranscript,
} from "@/lib/agent/messages";
import { SLOPPY_TOOLS } from "@/lib/agent/tools/registry";
import type { SloppyMessage } from "@/lib/agent/types";
import {
	findOrCreateConversation,
	listConversationMessages,
	saveConversationMessage,
} from "./conversations";
import { logger } from "./logger";
import { getLLMProvider } from "./providers";

/** What one turn may spend before the tools come off and it has to end in a reply. */
const MAX_TOOL_CALLS = 20;

export type AgentTurnRequest = {
	projectId: string;
	userId: string;
	message: SloppyMessage;
	context: AgentContext;
	/** The provider's own model id: the route resolves it from the picked name. */
	model?: string;
};

/**
 * One step of a turn: the model runs until it calls a tool, and the editor comes
 * back with the result as the next request. The round trip is the loop.
 */
export async function streamAgentTurn(
	request: AgentTurnRequest,
): Promise<Response> {
	const conversationId = await findOrCreateConversation(
		request.projectId,
		request.userId,
	);
	const history = await listConversationMessages(conversationId);
	const stored = history.find((row) => row.id === request.message.id);
	const incoming: SloppyMessage = {
		...request.message,
		metadata: stored?.metadata,
	};
	const messages = upsertMessage(history, incoming);
	await saveConversationMessage(conversationId, incoming);

	const carried = stored?.metadata?.workSeconds ?? 0;
	const { model, providerOptions } = getLLMProvider().agentModel(request.model);

	const modelMessages = pruneMessages({
		messages: await convertToModelMessages(pruneTranscript(messages), {
			tools: SLOPPY_TOOLS,
			ignoreIncompleteToolCalls: true,
		}),
	});

	const startedAt = Date.now();
	const result = streamText({
		model,
		instructions: sloppyInstructions(request.context),
		messages: modelMessages,
		tools: SLOPPY_TOOLS,
		// Withdrawing the tools is what ends a runaway turn: the model has nothing
		// left to call, so it answers the user instead of looping again.
		toolChoice: toolCallsMade(messages) >= MAX_TOOL_CALLS ? "none" : "auto",
		providerOptions,
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
