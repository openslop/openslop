import omit from "lodash/omit";
import pick from "lodash/pick";
import { NextResponse } from "next/server";
import { parseSloppyMessage } from "@/lib/agent/messages";
import { modelEntry, vendorParams } from "@/lib/connectors/models";
import type { ModelRef } from "@/lib/connectors/types";
import { agentTurnSchema, streamAgentTurn } from "./agent-turn";
import { refuseOverBudget } from "./budget";
import { bodySchema, LLM_FIELDS } from "./generation-schema";
import { createJob } from "./jobs";
import { badRequest } from "./response";
import { createSSEStreamResponse } from "./sse";
import type { RouteFamily } from "./route-families";

/** LLM calls stream instead of queueing, so each one is booked as a finished job. */
const recordSpend = (userId: string, model: ModelRef) => (costUsd: number) =>
	createJob({
		userId,
		connectorType: "llm",
		request: pick(model, "provider", "model"),
		status: "completed",
		costUsd,
	});

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
						await recordSpend(user.id, input)(yield* llm.stream(params));
					})(),
					"LLM",
				);
			const { output, costUsd } = await llm.generate(params);
			await recordSpend(user.id, input)(costUsd);
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
				recordSpend: recordSpend(user.id, input),
				llm: () => family.providerFor(user.id, "llm", input),
				model: modelEntry("llm", input).id,
			});
		},
	});
