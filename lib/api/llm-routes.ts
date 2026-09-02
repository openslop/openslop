import { NextResponse } from "next/server";
import { parseSloppyMessage } from "@/lib/agent/messages";
import { modelEntry } from "@/lib/connectors/models";
import type { ModelRef } from "@/lib/connectors/types";
import { agentTurnSchema, streamAgentTurn } from "./agentTurn";
import { bodySchema, LLM_FIELDS } from "./generation-schema";
import { badRequest } from "./response";
import { createSSEStreamResponse } from "./sse";
import type { RouteFamily } from "./route-families";

export const createLLMRouteHandler = <TModels, TPicked extends ModelRef>(
	family: RouteFamily<TModels, TPicked>,
	models: TModels,
) =>
	family.createHandler({
		schema: bodySchema(family.model(models), LLM_FIELDS),
		label: "LLM generation",
		handle: async ({ user, input }) => {
			const {
				stream,
				projectId: _projectId,
				provider: _provider,
				...rest
			} = input;
			const llm = await family.providerFor(user.id, "llm", input);
			const params = { ...rest, model: modelEntry("llm", input).id };
			return stream
				? createSSEStreamResponse(llm.stream(params), "LLM")
				: NextResponse.json(await llm.generate(params));
		},
	});

export const createAgentRouteHandler = <TModels, TPicked extends ModelRef>(
	family: RouteFamily<TModels, TPicked>,
	models: TModels,
) =>
	family.createHandler({
		schema: agentTurnSchema(family.model(models)),
		label: "Sloppy turn",
		handle: async ({ user, input }) => {
			const message = await parseSloppyMessage(input.message);
			if (!message) return badRequest("message is not a Sloppy message");
			return streamAgentTurn({
				...input,
				message,
				userId: user.id,
				llm: () => family.providerFor(user.id, "llm", input),
				model: modelEntry("llm", input).id,
			});
		},
	});
