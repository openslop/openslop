import { convertToModelMessages, pruneMessages, streamText } from "ai";
import { nanoid } from "nanoid";
import { stringifyError } from "@/lib/errors";
import { sloppySystemPrompt } from "@/lib/agent/prompt";
import {
	addUsage,
	carriedMetadata,
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
import type { AgentRequestRecord, SloppyMessage } from "@/lib/agent/types";
import {
	LLM_MODELS,
	type LLMModelName,
} from "@/lib/connectors/llm/openslop/models";
import { INPUT_LANGUAGE } from "@/lib/connectors/llm/plugins/language-prompt";
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
	language?: string;
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
	// The editor owns what a step did; the server owns what the turn cost and
	// what produced it. Metadata comes off the stored row, never off the wire.
	const incoming: SloppyMessage = {
		...request.message,
		metadata: history.find((stored) => stored.id === request.message.id)
			?.metadata,
	};
	const messages = upsertMessage(history, incoming);
	await saveConversationMessage(conversationId, incoming);

	const carried = carriedMetadata(messages);
	const { model, modelId, providerOptions } = getLLMProvider().agentModel(
		carried?.request?.model ?? (request.model && LLM_MODELS[request.model]),
	);
	const record: AgentRequestRecord = carried?.request ?? {
		system: sloppySystemPrompt(request.language || INPUT_LANGUAGE),
		model: modelId,
	};

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
		system: record.system,
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

	return result.toUIMessageStreamResponse<SloppyMessage>({
		originalMessages: messages,
		// The id is streamed with the message, so the editor and the row it is
		// stored in agree on which message a later step is extending.
		generateMessageId: nanoid,
		messageMetadata: ({ part }) => {
			// The turn keeps the request it opened with, so it is sent and stored
			// once rather than restated on every step.
			if (part.type === "start")
				return carried?.request ? undefined : { request: record };
			if (part.type !== "finish") return undefined;
			return {
				usage: addUsage(
					carried?.usage,
					part.totalUsage,
					Math.round((Date.now() - startedAt) / 1000),
				),
			};
		},
		onFinish: ({ responseMessage }) =>
			saveConversationMessage(conversationId, responseMessage),
		// The response is already on its way out, so nothing above can catch a
		// failed step. The SDK's default would swallow it into a placeholder.
		onError: (error) => {
			logger.error(error, "Sloppy turn");
			return stringifyError(error);
		},
	});
}
