import { NextRequest, NextResponse } from "next/server";
import { getTTSProvider } from "@/lib/api/providers";
import { badRequest, serverError } from "@/lib/api/response";
import { TTS_MODELS } from "@/lib/connectors/tts/openslop/models";
import { logger } from "@/lib/api/logger";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, voiceId, model } = body;

    if (!prompt || typeof prompt !== "string")
      return badRequest("prompt is required");
    if (!voiceId || typeof voiceId !== "string")
      return badRequest("voiceId is required");
    if (model && !TTS_MODELS.includes(model))
      return badRequest(`Invalid model. Supported: ${TTS_MODELS.join(", ")}`);

    const provider = getTTSProvider();
    const result = await provider.generate({ prompt, voiceId, model });

    return NextResponse.json(result);
  } catch (error) {
    logger.error(error, "TTS generation failed");
    return serverError("TTS generation failed");
  }
}
