import { z } from "zod";
import { streamAgentTurn } from "@/lib/api/agentTurn";
import { byokModelNames } from "@/lib/api/generation-schema";
import { createSessionRouteHandler } from "@/lib/api/route-handler";
import { badRequest } from "@/lib/api/response";
import { agentContextSchema } from "@/lib/agent/context";
import { parseSloppyMessage } from "@/lib/agent/messages";
import { LLM_MODELS } from "@/lib/connectors/llm/models";

const names = byokModelNames("llm");

const turnSchema = z.object({
	projectId: z.uuid(),
	message: z.unknown(),
	context: agentContextSchema,
	model: z.string().refine((name) => names.includes(name), {
		message: `Invalid model. Supported: ${names.join(", ")}`,
	}),
});

export const POST = createSessionRouteHandler({
	schema: turnSchema,
	label: "Sloppy turn",
	handle: async ({ user, input }) => {
		const message = await parseSloppyMessage(input.message);
		if (!message) return badRequest("message is not a Sloppy message");
		return streamAgentTurn({
			...input,
			message,
			userId: user.id,
			provider: LLM_MODELS.providerFor(input.model),
			model: LLM_MODELS.idFor(input.model),
		});
	},
});
