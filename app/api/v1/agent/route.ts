import { NextResponse } from "next/server";
import { z } from "zod";
import { runAgentTurn } from "@/lib/api/agentTurn";
import {
	findConversation,
	listConversationMessages,
} from "@/lib/api/conversations";
import {
	createApiQueryRouteHandler,
	createApiRouteHandler,
} from "@/lib/api/route-handler";
import { createSSEStreamResponse } from "@/lib/api/sse";
import { isLLMModelName } from "@/lib/connectors/llm/openslop/models";

const turnSchema = z.object({
	projectId: z.uuid(),
	message: z.string().min(1, { message: "message is required" }),
	// The canvas as it stands. Sent per request and never persisted, so history
	// holds messages only and never accumulates stale copies of the document.
	script: z.string().default(""),
	language: z.string().optional(),
	model: z.string().refine(isLLMModelName).optional(),
});

export const POST = createApiRouteHandler({
	schema: turnSchema,
	label: "Sloppy turn",
	handle: async ({ user, input }) =>
		createSSEStreamResponse(
			runAgentTurn({ ...input, userId: user.id }),
			"Sloppy turn",
		),
});

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
