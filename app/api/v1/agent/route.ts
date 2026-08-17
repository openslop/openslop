import { NextResponse } from "next/server";
import { z } from "zod";
import { streamAgentTurn } from "@/lib/api/agentTurn";
import {
	findConversation,
	listConversationMessages,
} from "@/lib/api/conversations";
import {
	createApiQueryRouteHandler,
	createApiRouteHandler,
} from "@/lib/api/route-handler";
import { badRequest } from "@/lib/api/response";
import { parseSloppyMessage } from "@/lib/agent/messages";
import { isLLMModelName } from "@/lib/connectors/llm/openslop/models";

const turnSchema = z.object({
	projectId: z.uuid(),
	message: z.unknown(),
	language: z.string().optional(),
	model: z.string().refine(isLLMModelName).optional(),
});

export const POST = createApiRouteHandler({
	schema: turnSchema,
	label: "Sloppy turn",
	handle: async ({ user, input }) => {
		const message = await parseSloppyMessage(input.message);
		if (!message) return badRequest("message is not a Sloppy message");
		return streamAgentTurn({ ...input, message, userId: user.id });
	},
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
