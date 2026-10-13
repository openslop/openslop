import type { User } from "@supabase/supabase-js";
import omit from "lodash/omit";
import pick from "lodash/pick";
import { NextResponse } from "next/server";
import { parseSloppyMessage } from "@/lib/agent/messages";
import { modelEntry, vendorParams } from "@/lib/connectors/models";
import type { ModelRef } from "@/lib/connectors/types";
import { agentTurnSchema, streamAgentTurn } from "./agent-turn";
import { admitJob } from "./budget";
import { bodySchema, LLM_FIELDS } from "./generation-schema";
import { badRequest } from "./response";
import { failJobOnThrow, settleJob, settleJobWith } from "./settle-job";
import { createSSEStreamResponse } from "./sse";
import type { RouteFamily } from "./route-families";

const admitLLMCall = <TPicked extends ModelRef>(
	family: RouteFamily<TPicked>,
	user: User,
	input: ModelRef & { projectId?: string },
) =>
	admitJob(family, user, "llm", {
		projectId: input.projectId,
		request: pick(input, "provider", "model"),
	});

export const createLLMRouteHandler = <TPicked extends ModelRef>(
	family: RouteFamily<TPicked>,
) =>
	family.createHandler({
		schema: bodySchema(family.model("llm"), LLM_FIELDS),
		label: "LLM generation",
		handle: async ({ user, input }) => {
			const llm = await family.providerFor(user.id, "llm", input);
			const admitted = await admitLLMCall(family, user, input);
			if (!admitted.ok) return admitted.response;
			const { jobId } = admitted;
			const params = vendorParams("llm", omit(input, "stream", "projectId"));
			if (input.stream)
				return createSSEStreamResponse(
					settleJobWith(jobId, llm.stream(params)),
					"LLM",
				);
			return NextResponse.json(
				await settleJob(jobId, () => llm.generate(params)),
			);
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
			const admitted = await admitLLMCall(family, user, input);
			if (!admitted.ok) return admitted.response;
			const { jobId } = admitted;
			return failJobOnThrow(jobId, () =>
				streamAgentTurn({
					...input,
					message,
					userId: user.id,
					jobId,
					llm: () => family.providerFor(user.id, "llm", input),
					model: modelEntry("llm", input).id,
				}),
			);
		},
	});
