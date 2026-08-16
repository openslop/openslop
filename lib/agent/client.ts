import { OpenSlopClient } from "@/lib/clients/openslop";
import { readSSE } from "@/lib/api/sse";
import type { AgentMessageRow, AgentStreamPart } from "./types";
import type { ModelMessage } from "ai";

const AGENT_PATH = "/api/v1/agent";

const client = new OpenSlopClient();

export type SendTurnInput = {
	projectId: string;
	message: string;
	script: string;
	language?: string;
	model?: string;
};

/** Streams one assistant turn. The turn ends at a tool call; it is not resumed. */
export async function* sendAgentTurn(
	input: SendTurnInput,
): AsyncGenerator<AgentStreamPart> {
	const res = await client.postStream(AGENT_PATH, input);
	if (!res.body) throw new Error("No response body");
	yield* readSSE<AgentStreamPart>(res.body);
}

export async function loadAgentTranscript(
	projectId: string,
): Promise<AgentMessageRow[]> {
	const { messages } = await client.get<{ messages: AgentMessageRow[] }>(
		AGENT_PATH,
		{ projectId },
	);
	return messages;
}

export async function reportToolResults(
	projectId: string,
	messages: ModelMessage[],
): Promise<void> {
	await client.post(`${AGENT_PATH}/messages`, { projectId, messages });
}
