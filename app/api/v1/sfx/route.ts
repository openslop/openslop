import { NextRequest } from "next/server";
import { getSFXProvider } from "@/lib/api/providers";
import { badRequest, serverError } from "@/lib/api/response";
import { validateModel } from "@/lib/api/validate-model";
import { SFX_MODELS } from "@/lib/connectors/sfx/openslop/models";
import { logger } from "@/lib/api/logger";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, model, durationSeconds } = body;

    if (!prompt || typeof prompt !== "string")
      return badRequest("prompt is required");
    const modelError = validateModel(model, SFX_MODELS);
    if (modelError) return modelError;

    const provider = getSFXProvider();
    const buffer = await provider.generate({ prompt, model, durationSeconds });

    return new Response(buffer, {
      headers: { "content-type": "audio/mpeg" },
    });
  } catch (error) {
    logger.error(error, "SFX generation failed");
    return serverError("SFX generation failed");
  }
}
