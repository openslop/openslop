import omit from "lodash/omit";
import { NextResponse } from "next/server";
import { parseSloppyMessage } from "@/lib/agent/messages";
import { modelEntry, vendorParams } from "@/lib/connectors/models";
import type { ModelRef } from "@/lib/connectors/types";
import { agentTurnSchema, streamAgentTurn } from "./agentTurn";
import { bodySchema, LLM_FIELDS } from "./generation-schema";
import { badRequest } from "./response";
import { createSSEStreamResponse } from "./sse";
import type { RouteFamily } from "./route-families";

export const createLLMRouteHandler = <TPicked extends ModelRef>(
	family: RouteFamily<TPicked>,
) =>
	family.createHandler({
		schema: bodySchema(family.model("llm"), LLM_FIELDS),
		label: "LLM generation",
		handle: async ({ user, input }) => {
			const llm = await family.providerFor(user.id, "llm", input);
			const params = vendorParams("llm", omit(input, "stream", "projectId"));
			return input.stream
				? createSSEStreamResponse(llm.stream(params), "LLM")
				: NextResponse.json(await llm.generate(params));
		},
	});

export const createAgentRouteHandler = <TPicked extends ModelRef>(
	family: RouteFamily<TPicked>,
) =>
	family.createHandler({
		schema: agentTurnSchema(family.model("llm")),
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
