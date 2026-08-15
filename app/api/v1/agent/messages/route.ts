import { NextResponse } from "next/server";
import { toolModelMessageSchema } from "ai";
import { z } from "zod";
import {
	appendConversationMessages,
	findOrCreateConversation,
} from "@/lib/api/conversations";
import { createApiRouteHandler } from "@/lib/api/route-handler";

/**
 * Only tool results. The editor reports what a tool call did; every other row
 * is written by the server, so a transcript cannot be authored from a browser.
 */
const schema = z.object({
	projectId: z.uuid(),
	messages: z.array(toolModelMessageSchema).min(1),
});

export const POST = createApiRouteHandler({
	schema,
	label: "Sloppy tool results",
	handle: async ({ user, input }) => {
		const conversationId = await findOrCreateConversation(
			input.projectId,
			user.id,
		);
		await appendConversationMessages(conversationId, input.messages);
		return NextResponse.json({ ok: true });
	},
});
