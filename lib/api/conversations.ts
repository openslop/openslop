import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { parseSloppyMessages } from "@/lib/agent/messages";
import type { SloppyMessage } from "@/lib/agent/types";

/** One client per request: `createClient` re-reads cookies and rebuilds an adapter each call. */
const client = cache(createClient);

export async function findConversation(
	projectId: string,
	userId: string,
): Promise<string | null> {
	const supabase = await client();
	const { data, error } = await supabase
		.from("conversations")
		.select("id")
		.eq("project_id", projectId)
		.eq("user_id", userId)
		.maybeSingle();
	if (error) throw error;
	return data?.id ?? null;
}

export async function findOrCreateConversation(
	projectId: string,
	userId: string,
): Promise<string> {
	const existing = await findConversation(projectId, userId);
	if (existing) return existing;

	const supabase = await client();
	const created = await supabase
		.from("conversations")
		.insert({ project_id: projectId, user_id: userId })
		.select("id")
		.single();
	// Another request may have created it between the read and the write.
	if (created.error) {
		const retry = await findConversation(projectId, userId);
		if (retry) return retry;
		throw created.error;
	}
	return created.data.id;
}

export async function listConversationMessages(
	conversationId: string,
): Promise<SloppyMessage[]> {
	const supabase = await client();
	const { data, error } = await supabase
		.from("messages")
		.select("message")
		.eq("conversation_id", conversationId)
		.order("seq", { ascending: true });
	if (error) throw error;

	return parseSloppyMessages(data.map((row) => row.message));
}

/** Keyed on the message's own id, so a step rewrites its turn rather than adding one. */
export async function saveConversationMessage(
	conversationId: string,
	message: SloppyMessage,
): Promise<void> {
	const supabase = await client();
	const { error } = await supabase.from("messages").upsert(
		{
			conversation_id: conversationId,
			message_id: message.id,
			role: message.role,
			message,
		},
		{ onConflict: "conversation_id,message_id" },
	);
	if (error) throw error;
}
