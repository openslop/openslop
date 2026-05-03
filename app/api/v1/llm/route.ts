import { NextResponse } from "next/server";
import { z } from "zod";
import { logger } from "@/lib/api/logger";
import { getLLMProvider } from "@/lib/api/providers";
import { bodySchema, createRouteHandler } from "@/lib/api/route-handler";
import { formatSSE } from "@/lib/api/sse";
import { LLM_MODELS } from "@/lib/connectors/llm/openslop/models";

const schema = bodySchema(LLM_MODELS, {
	systemPrompt: z.string().optional(),
	thinkingLevel: z.string().optional(),
	maxTokens: z.number().optional(),
	temperature: z.number().optional(),
	stream: z.boolean().optional(),
});

export const POST = createRouteHandler({
	schema,
	getProvider: getLLMProvider,
	label: "LLM generation",
	handle: async (provider, body) => {
		const { stream, ...genParams } = body;

		if (stream) {
			const encoder = new TextEncoder();
			const readable = new ReadableStream({
				async start(controller) {
					try {
						for await (const chunk of provider.stream(genParams)) {
							controller.enqueue(encoder.encode(formatSSE(chunk)));
						}
						controller.close();
					} catch (error) {
						logger.error(error, "LLM stream error");
						controller.error(error);
					}
				},
			});

			return new Response(readable, {
				headers: {
					"content-type": "text/event-stream",
					"cache-control": "no-cache",
					connection: "keep-alive",
				},
			});
		}

		return NextResponse.json(await provider.generate(genParams));
	},
});
