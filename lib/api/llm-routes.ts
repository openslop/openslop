import omit from "lodash/omit";
import { NextResponse } from "next/server";
import { parseSloppyMessage } from "@/lib/agent/messages";
import { modelEntry, vendorParams } from "@/lib/connectors/models";
import type { ModelRef } from "@/lib/connectors/types";
import { agentTurnSchema, streamAgentTurn } from "./agent-turn";
import { refuseOverBudget } from "./budget";
import { bodySchema, LLM_FIELDS } from "./generation-schema";
import { recordLLMSpend } from "./jobs";
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
			const refused = await refuseOverBudget(family, user);
			if (refused) return refused;
			const llm = await family.providerFor(user.id, "llm", input);
			const params = vendorParams("llm", omit(input, "stream", "projectId"));
			if (input.stream)
				return createSSEStreamResponse(
					(async function* () {
						const costUsd = yield* llm.stream(params);
						await recordLLMSpend(user.id, input, costUsd);
					})(),
					"LLM",
				);
			const { output, costUsd } = await llm.generate(params);
			await recordLLMSpend(user.id, input, costUsd);
			return NextResponse.json(output);
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
			const refused = await refuseOverBudget(family, user);
			if (refused) return refused;
			return streamAgentTurn({
				...input,
				message,
				userId: user.id,
				llm: () => family.providerFor(user.id, "llm", input),
				model: modelEntry("llm", input).id,
			});
		},
	});
