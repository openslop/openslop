import { apiJson } from "@/lib/clients/http";
import type { ModelRef } from "@/lib/connectors/types";
import { apiPrefixFor } from "@/lib/gateway/prefix";
import type { SloppyMessage } from "./types";

const TRANSCRIPT_PATH = "/api/agent/transcript";

export const agentPathFor = (model: ModelRef): string =>
	`${apiPrefixFor(model.provider)}/agent`;

export async function loadAgentTranscript(
	projectId: string,
): Promise<SloppyMessage[]> {
	const { messages } = await apiJson<{ messages: SloppyMessage[] }>(
		TRANSCRIPT_PATH,
		{ params: { projectId } },
	);
	return messages;
}
