import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import {
	pendingToolCalls,
	type AgentMessageRow,
	type AgentRequestRecord,
	type AgentUsage,
} from "@/lib/agent/types";
import { modelMessageSchema, type ModelMessage } from "ai";

/** One client per request: `createClient` re-reads cookies and rebuilds an adapter each call. */
const client = cache(createClient);

type MessageRow = {
	id: string;
	message: unknown;
	request: AgentRequestRecord | null;
	usage: AgentUsage | null;
};

export type AppendExtras = {
	request?: AgentRequestRecord;
	usage?: AgentUsage;
};

export async function findConversation(
	projectId: string,
): Promise<string | null> {
	const supabase = await client();
	const { data, error } = await supabase
		.from("conversations")
		.select("id")
		.eq("project_id", projectId)
		.maybeSingle();
	if (error) throw error;
	return data?.id ?? null;
}

export async function findOrCreateConversation(
	projectId: string,
	userId: string,
): Promise<string> {
	const existing = await findConversation(projectId);
	if (existing) return existing;

	const supabase = await client();
	const created = await supabase
		.from("conversations")
		.insert({ project_id: projectId, user_id: userId })
		.select("id")
		.single();
	// Another request may have created it between the read and the write.
	if (created.error) {
		const retry = await findConversation(projectId);
		if (retry) return retry;
		throw created.error;
	}
	return created.data.id;
}

function toAgentMessageRow(row: MessageRow): AgentMessageRow {
	return {
		id: row.id,
		message: modelMessageSchema.parse(row.message),
		request: row.request,
		usage: row.usage,
	};
}

export async function listConversationMessages(
	conversationId: string,
): Promise<AgentMessageRow[]> {
	const supabase = await client();
	const { data, error } = await supabase
		.from("messages")
		.select("*")
		.eq("conversation_id", conversationId)
		.order("seq", { ascending: true });
	if (error) throw error;
	return (data as MessageRow[]).map(toAgentMessageRow);
}

export async function appendConversationMessages(
	conversationId: string,
	messages: ModelMessage[],
	extras: AppendExtras = {},
): Promise<AgentMessageRow[]> {
	if (messages.length === 0) return [];
	const supabase = await client();
	const { data, error } = await supabase
		.from("messages")
		.insert(
			messages.map((message, index) => ({
				conversation_id: conversationId,
				role: message.role,
				message,
				// Extras describe the turn, so they ride on its first row.
				request: index === 0 ? (extras.request ?? null) : null,
				usage: index === 0 ? (extras.usage ?? null) : null,
			})),
		)
		.select("*");
	if (error) throw error;
	return (data as MessageRow[]).map(toAgentMessageRow);
}

/**
 * A closed tab leaves a tool call with no result, which a vendor rejects on the
 * next request. Record an honest cancellation for anything left dangling.
 */
export function abandonedToolResults(
	history: AgentMessageRow[],
): ModelMessage[] {
	const pending = pendingToolCalls(history.map((row) => row.message));
	if (pending.length === 0) return [];

	return [
		{
			role: "tool",
			content: pending.map((call) => ({
				type: "tool-result" as const,
				toolCallId: call.toolCallId,
				toolName: call.toolName,
				output: {
					type: "error-text" as const,
					value: "Cancelled: the editor disconnected before this ran.",
				},
			})),
		},
	];
}
