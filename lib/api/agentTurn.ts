import {
	convertToModelMessages,
	createUIMessageStreamResponse,
	pruneMessages,
	streamText,
	toUIMessageStream,
} from "ai";
import { nanoid } from "nanoid";
import { stringifyError } from "@/lib/errors";
import { SLOPPY_SYSTEM_PROMPT } from "@/lib/agent/prompt";
import {
	toolCallsMade,
	toolsUsed,
	upsertMessage,
	withoutStaleReadings,
} from "@/lib/agent/messages";
import {
	AGENT_TOOL_NAMES,
	ONCE_PER_TURN,
	SLOPPY_TOOLS,
} from "@/lib/agent/tools/specs";
import type { SloppyMessage } from "@/lib/agent/types";
import {
	LLM_MODELS,
	type LLMModelName,
} from "@/lib/connectors/llm/openslop/models";
import {
	findOrCreateConversation,
	listConversationMessages,
	saveConversationMessage,
} from "./conversations";
import { logger } from "./logger";
import { getLLMProvider } from "./providers";

/** What one turn may spend before the tools come off and it has to end in a reply. */
const MAX_TOOL_CALLS = 12;

export type AgentTurnRequest = {
	projectId: string;
	userId: string;
	message: SloppyMessage;
	model?: LLMModelName;
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
	const { model, providerOptions } = getLLMProvider().agentModel(
		request.model && LLM_MODELS[request.model],
	);

	// Dropping a finished turn's readings can leave a step with nothing in it,
	// and a vendor rejects an empty message.
	const modelMessages = pruneMessages({
		messages: await convertToModelMessages(withoutStaleReadings(messages), {
			tools: SLOPPY_TOOLS,
			// A closed tab leaves a call the editor never answered, and a vendor
			// rejects a history that carries one.
			ignoreIncompleteToolCalls: true,
		}),
	});

	const spent = toolsUsed(messages);
	const startedAt = Date.now();
	const result = streamText({
		model,
		instructions: SLOPPY_SYSTEM_PROMPT,
		messages: modelMessages,
		tools: SLOPPY_TOOLS,
		activeTools: AGENT_TOOL_NAMES.filter(
			(name) => !ONCE_PER_TURN.has(name) || !spent.has(name),
		),
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
			messageMetadata: ({ part }) =>
				part.type === "finish"
					? {
							workSeconds:
								carried + Math.round((Date.now() - startedAt) / 1000),
						}
					: undefined,
			onEnd: ({ responseMessage }) =>
				saveConversationMessage(conversationId, responseMessage),
			onError: (error) => {
				logger.error(error, "Sloppy turn");
				return stringifyError(error);
			},
		}),
	});
}
