import { NextResponse } from "next/server";
import { llmProviderFor } from "@/lib/api/providers";
import { byokBodySchema, LLM_FIELDS } from "@/lib/api/generation-schema";
import { createSessionRouteHandler } from "@/lib/api/route-handler";
import { createSSEStreamResponse } from "@/lib/api/sse";
import { LLM_MODELS } from "@/lib/connectors/llm/models";

export const POST = createSessionRouteHandler({
	schema: byokBodySchema("llm", LLM_FIELDS),
	label: "LLM generation",
	handle: async ({ user, input }) => {
		const { stream, model, projectId: _projectId, ...rest } = input;
		const llm = await llmProviderFor({
			userId: user.id,
			provider: LLM_MODELS.providerFor(model),
		});
		const genParams = { ...rest, model: LLM_MODELS.idFor(model) };
		if (stream) {
			return createSSEStreamResponse(llm.stream(genParams), "LLM");
		}
		return NextResponse.json(await llm.generate(genParams));
	},
});
