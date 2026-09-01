import { NextResponse } from "next/server";
import { parseSloppyMessage } from "@/lib/agent/messages";
import { providerForModel, vendorModelFor } from "@/lib/connectors/models";
import { agentTurnSchema, streamAgentTurn } from "./agentTurn";
import { bodySchema, LLM_FIELDS, modelField } from "./generation-schema";
import type { ModelScope } from "./generation-schema";
import { llmProviderFor } from "./providers";
import { badRequest } from "./response";
import { createApiRouteHandler } from "./route-handler";
import { createSSEStreamResponse } from "./sse";

/** The provider a model names, holding whichever key the caller generates on. */
const llmFor = (userId: string, model: string | undefined) =>
	llmProviderFor({ userId, provider: providerForModel("llm", model) });

/**
 * Text answered in the request rather than queued as a job. The families differ
 * only in who they let in and which models they take: the model names the
 * provider either way, and the key is our own or the caller's accordingly.
 */
export const createLLMRouteHandler = (
	createHandler: typeof createApiRouteHandler,
	scope: ModelScope,
) =>
	createHandler({
		schema: bodySchema("llm", scope, LLM_FIELDS),
		label: "LLM generation",
		handle: async ({ user, input }) => {
			const { stream, model, projectId: _projectId, ...rest } = input;
			const llm = await llmFor(user.id, model);
			// The vendor's own id, at the last moment before it is called.
			const params = { ...rest, model: vendorModelFor("llm", model) };
			return stream
				? createSSEStreamResponse(llm.stream(params), "LLM")
				: NextResponse.json(await llm.generate(params));
		},
	});

/** One Sloppy turn, streamed back as the agent works. */
export const createAgentRouteHandler = (
	createHandler: typeof createApiRouteHandler,
	scope: ModelScope,
) =>
	createHandler({
		schema: agentTurnSchema(modelField("llm", scope)),
		label: "Sloppy turn",
		handle: async ({ user, input }) => {
			const message = await parseSloppyMessage(input.message);
			if (!message) return badRequest("message is not a Sloppy message");
			return streamAgentTurn({
				...input,
				message,
				userId: user.id,
				provider: providerForModel("llm", input.model),
				model: vendorModelFor("llm", input.model),
			});
		},
	});
