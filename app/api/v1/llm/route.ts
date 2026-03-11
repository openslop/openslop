import { NextRequest, NextResponse } from "next/server";
import { getLLMProvider } from "@/lib/api/providers";
import { badRequest, serverError } from "@/lib/api/response";
import { LLM_MODELS } from "@/lib/connectors/llm/openslop/models";
import { logger } from "@/lib/api/logger";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      prompt,
      model,
      systemPrompt,
      thinkingLevel,
      maxTokens,
      temperature,
      stream,
    } = body;

    if (!prompt || typeof prompt !== "string")
      return badRequest("prompt is required");
    if (model && !LLM_MODELS.includes(model))
      return badRequest(`Invalid model. Supported: ${LLM_MODELS.join(", ")}`);

    const provider = getLLMProvider();
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

    return NextResponse.json(result);
  } catch (error) {
    logger.error(error, "LLM generation failed");
    return serverError("LLM generation failed");
  }
}
