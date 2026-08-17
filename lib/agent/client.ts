import { OpenSlopClient } from "@/lib/clients/openslop";
import type { SloppyMessage } from "./types";

export const AGENT_PATH = "/api/v1/agent";

const client = new OpenSlopClient();

export async function loadAgentTranscript(
	projectId: string,
): Promise<SloppyMessage[]> {
	const { messages } = await client.get<{ messages: SloppyMessage[] }>(
		AGENT_PATH,
		{ projectId },
	);
	return messages;
}
