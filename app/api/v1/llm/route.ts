import { getLLMProvider } from "@/lib/api/providers";
import { createRouteHandler, jsonResponse } from "@/lib/api/route-handler";
import { LLM_MODELS } from "@/lib/connectors/llm/openslop/models";
import { logger } from "@/lib/api/logger";

export const POST = createRouteHandler({
  models: LLM_MODELS,
  getProvider: getLLMProvider,
  label: "LLM generation",
  handle: async (provider, body) => {
    const {
      prompt,
      model,
      systemPrompt,
      thinkingLevel,
      maxTokens,
      temperature,
      stream,
    } = body;
    const genParams = {
      prompt,
      model,
      systemPrompt,
      thinkingLevel,
      maxTokens,
      temperature,
    };

    if (stream) {
      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of provider.stream(genParams)) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`),
              );
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

    const result = await provider.generate(genParams);
    return jsonResponse(result);
  },
});
