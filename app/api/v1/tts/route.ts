import { NextRequest, NextResponse } from "next/server";
import { getTTSProvider } from "@/lib/api/providers";
import { badRequest, serverError } from "@/lib/api/response";
import { validateModel } from "@/lib/api/validate-model";
import { TTS_MODELS } from "@/lib/connectors/tts/openslop/models";
import { logger } from "@/lib/api/logger";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, voiceId, model, speed, volume, format } = body;

    if (!prompt || typeof prompt !== "string")
      return badRequest("prompt is required");
    if (!voiceId || typeof voiceId !== "string")
      return badRequest("voiceId is required");
    const modelError = validateModel(model, TTS_MODELS);
    if (modelError) return modelError;

    const provider = getTTSProvider();
    const result = await provider.generate({
      prompt,
      voiceId,
      model,
      speed,
      volume,
      format,
    });

    return NextResponse.json(result);
  } catch (error) {
    logger.error(error, "TTS generation failed");
    return serverError("TTS generation failed");
  }
}
