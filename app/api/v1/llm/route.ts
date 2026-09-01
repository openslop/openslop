import { NextResponse } from "next/server";
import { getLLMProvider } from "@/lib/api/providers";
import { bodySchema, LLM_FIELDS } from "@/lib/api/generation-schema";
import { createApiRouteHandler } from "@/lib/api/route-handler";
import { createSSEStreamResponse } from "@/lib/api/sse";
import { LLM_MODELS } from "@/lib/connectors/llm/models";
import { OPENSLOP_LLM_MODELS } from "@/lib/connectors/llm/openslop/models";

export const POST = createApiRouteHandler({
	schema: bodySchema(OPENSLOP_LLM_MODELS, LLM_FIELDS),
	label: "LLM generation",
	handle: async ({ input }) => {
		const provider = getLLMProvider();
		const { stream, model, ...rest } = input;
		const genParams = { ...rest, model: LLM_MODELS.idFor(model) };
		if (stream) {
			return createSSEStreamResponse(provider.stream(genParams), "LLM");
		}
		return NextResponse.json(await provider.generate(genParams));
	},
});
