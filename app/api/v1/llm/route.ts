import { NextResponse } from "next/server";
import { z } from "zod";
import { getLLMProvider } from "@/lib/api/providers";
import { bodySchema, createApiRouteHandler } from "@/lib/api/route-handler";
import {
	optionalLlmSampling,
	optionalReferenceImages,
} from "@/lib/api/request-schema-fields";
import { createSSEStreamResponse } from "@/lib/api/sse";
import { LLM_MODELS } from "@/lib/connectors/llm/openslop/models";

const schema = bodySchema(LLM_MODELS, {
	systemPrompt: z.string().optional(),
	thinkingLevel: z.string().optional(),
	...optionalLlmSampling,
	...optionalReferenceImages,
	stream: z.boolean().optional(),
});

export const POST = createApiRouteHandler({
	schema,
	label: "LLM generation",
	handle: async ({ body }) => {
		const provider = getLLMProvider();
		const { stream, ...genParams } = body;
		if (stream) {
			return createSSEStreamResponse(provider.stream(genParams), "LLM");
		}
		return NextResponse.json(await provider.generate(genParams));
	},
});
