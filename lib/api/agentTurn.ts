import { stepCountIs, streamText, tool, type ToolSet } from "ai";
import { sloppySystemPrompt } from "@/lib/agent/prompt";
import { AGENT_TOOL_SPECS, type AgentToolSpec } from "@/lib/agent/tools/specs";
import type {
	AgentMessage,
	AgentRequestRecord,
	AgentStreamPart,
	AgentUsage,
} from "@/lib/agent/types";
import { INPUT_LANGUAGE } from "@/lib/connectors/llm/plugins/language-prompt";
import { errorMessage } from "@/lib/errors";
import {
	abandonedToolResults,
	appendConversationMessages,
	findOrCreateConversation,
	listConversationMessages,
} from "./conversations";
import { getLLMProvider } from "./providers";

/**
 * Tools are declared without an executor, so the SDK surfaces the call and
 * stops rather than running anything. The canvas lives in the browser, so the
 * client is what executes them.
 */
const TOOL_SET: ToolSet = Object.fromEntries(
	AGENT_TOOL_SPECS.map((spec: AgentToolSpec) => [
		spec.name,
		tool({ description: spec.description, inputSchema: spec.inputSchema }),
	]),
);

/** Parts the panel renders. Their SDK shapes are already what it reads. */
const FORWARDED = new Set(["text-delta", "reasoning-delta", "tool-call"]);

export type AgentTurnRequest = {
	projectId: string;
	userId: string;
	message: string;
	/** The canvas as it stands. Composed into the prompt, never persisted. */
	script: string;
	language?: string;
};

/**
 * One model call, not an agent loop: a client tool result is recorded rather
 * than fed back, so a turn ends at its tool call.
 */
export async function* runAgentTurn(
	request: AgentTurnRequest,
): AsyncGenerator<AgentStreamPart> {
	const conversationId = await findOrCreateConversation(
		request.projectId,
		request.userId,
	);
	const history = await listConversationMessages(conversationId);

	const opening: AgentMessage[] = [
		...abandonedToolResults(history),
		{ role: "user", content: request.message },
	];
	await appendConversationMessages(conversationId, opening);

	const { model, modelId, providerOptions } = getLLMProvider().agentModel();
	const system = sloppySystemPrompt(
		request.script,
		request.language || INPUT_LANGUAGE,
	);
	const record: AgentRequestRecord = { system, model: modelId };
	yield { type: "request", request: record };

	const result = streamText({
		model,
		system,
		messages: [...history.map((row) => row.message), ...opening],
		tools: TOOL_SET,
		stopWhen: stepCountIs(1),
		providerOptions,
	});

	// Timed here rather than in the panel, so the label a turn streams under is
	// the same number the stored row keeps.
	const startedAt = Date.now();
	let thinkingSince: number | null = null;
	let thoughtSeconds: number | undefined;

	for await (const part of result.fullStream) {
		if (part.type === "reasoning-start") thinkingSince ??= Date.now();
		else if (part.type === "reasoning-end" && thinkingSince !== null) {
			thoughtSeconds = Math.round((Date.now() - thinkingSince) / 1000);
			yield { type: "reasoning-end", seconds: thoughtSeconds };
		} else if (FORWARDED.has(part.type)) yield part as AgentStreamPart;
		else if (part.type === "error")
			yield { type: "error", message: errorMessage(part.error) };
	}

	const [response, totalUsage] = await Promise.all([
		result.response,
		result.totalUsage,
	]);
	const usage: AgentUsage = {
		inputTokens: totalUsage.inputTokens ?? 0,
		outputTokens: totalUsage.outputTokens ?? 0,
		thoughtSeconds,
		workSeconds: Math.round((Date.now() - startedAt) / 1000),
	};

	await appendConversationMessages(conversationId, response.messages, {
		request: record,
		usage,
	});

	yield { type: "finish", usage };
}
