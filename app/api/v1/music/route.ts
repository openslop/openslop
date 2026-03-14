import { NextRequest } from "next/server";
import { getMusicProvider } from "@/lib/api/providers";
import { badRequest, serverError } from "@/lib/api/response";
import { validateModel } from "@/lib/api/validate-model";
import { MUSIC_MODELS } from "@/lib/connectors/music/openslop/models";
import { logger } from "@/lib/api/logger";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, model, durationSeconds } = body;

    if (!prompt || typeof prompt !== "string")
      return badRequest("prompt is required");
    const modelError = validateModel(model, MUSIC_MODELS);
    if (modelError) return modelError;

    const provider = getMusicProvider();
    const buffer = await provider.generate({ prompt, model, durationSeconds });

    return new Response(buffer, {
      headers: { "content-type": "audio/mpeg" },
    });
  } catch (error) {
    logger.error(error, "Music generation failed");
    return serverError("Music generation failed");
  }
}
