import { NextResponse } from "next/server";
import { z } from "zod";
import {
	findConversation,
	listConversationMessages,
} from "@/lib/api/conversations";
import { createAgentRouteHandler } from "@/lib/api/llm-routes";
import { HOSTED } from "@/lib/api/route-families";
import { createApiQueryRouteHandler } from "@/lib/api/route-handler";

export const POST = createAgentRouteHandler(HOSTED);

export const GET = createApiQueryRouteHandler({
	schema: z.object({ projectId: z.uuid() }),
	label: "Sloppy transcript",
	handle: async ({ user, input }) => {
		const conversationId = await findConversation(input.projectId, user.id);
		const messages = conversationId
			? await listConversationMessages(conversationId)
			: [];
		return NextResponse.json({ messages });
	},
});
