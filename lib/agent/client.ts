import { apiJson } from "@/lib/clients/http";
import type { ModelRef } from "@/lib/connectors/types";
import { apiPrefixFor, OPENSLOP_API_PREFIX } from "@/lib/gateway/prefix";
import type { SloppyMessage } from "./types";

/** The transcript is ours to serve whoever the turns ran on. */
export const AGENT_PATH = `${OPENSLOP_API_PREFIX}/agent`;

export const agentPathFor = (model: ModelRef): string =>
	`${apiPrefixFor(model.provider)}/agent`;

export async function loadAgentTranscript(
	projectId: string,
): Promise<SloppyMessage[]> {
	const { messages } = await apiJson<{ messages: SloppyMessage[] }>(
		AGENT_PATH,
		{ params: { projectId } },
	);
	return messages;
}
