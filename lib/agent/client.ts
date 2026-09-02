import { ApiClient } from "@/lib/clients/apiClient";
import type { ModelRef } from "@/lib/connectors/types";
import { apiPrefixFor, OPENSLOP_API_PREFIX } from "@/lib/gateway/prefix";
import type { SloppyMessage } from "./types";

/** The transcript is ours to serve whoever the turns ran on. */
export const AGENT_PATH = `${OPENSLOP_API_PREFIX}/agent`;

export const agentPathFor = (model: ModelRef): string =>
	`${apiPrefixFor(model.provider)}/agent`;

const client = new ApiClient();

export async function loadAgentTranscript(
	projectId: string,
): Promise<SloppyMessage[]> {
	const { messages } = await client.get<{ messages: SloppyMessage[] }>(
		AGENT_PATH,
		{ projectId },
	);
	return messages;
}
