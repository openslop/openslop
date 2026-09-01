import { ApiClient } from "@/lib/clients/apiClient";
import { providerForModel } from "@/lib/connectors/models";
import { apiPrefixFor, OPENSLOP_API_PREFIX } from "@/lib/gateway/prefix";
import type { SloppyMessage } from "./types";

/** The transcript is ours to serve whoever the turns ran on. */
export const AGENT_PATH = `${OPENSLOP_API_PREFIX}/agent`;

/** Where a Sloppy turn on this model is served from. */
export const agentPathFor = (model: string | undefined): string =>
	`${apiPrefixFor(providerForModel("llm", model))}/agent`;

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
