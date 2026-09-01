import { ApiClient } from "@/lib/clients/apiClient";
import { providerForModel } from "@/lib/connectors/models";
import { MANAGED_PROVIDER } from "@/lib/connectors/providerCatalog";
import type { SloppyMessage } from "./types";

export const AGENT_PATH = "/api/v1/agent";

/** The same turn, run on a key the user brought. */
export const THIRD_PARTY_AGENT_PATH = "/api/third-party/agent";

/** Where a Sloppy turn on this model is served from. */
export const agentPathFor = (model: string | undefined): string =>
	providerForModel("llm", model) === MANAGED_PROVIDER
		? AGENT_PATH
		: THIRD_PARTY_AGENT_PATH;

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
