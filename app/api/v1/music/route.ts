import { NextRequest } from "next/server";
import { getMusicProvider } from "@/lib/api/providers";
import { badRequest, serverError } from "@/lib/api/response";
import { MUSIC_MODELS } from "@/lib/connectors/music/openslop/models";
import { logger } from "@/lib/api/logger";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, model, durationSeconds } = body;

    if (!prompt || typeof prompt !== "string")
      return badRequest("prompt is required");
    const validModels = Object.values(MUSIC_MODELS);
    if (model && !validModels.includes(model))
      return badRequest(`Invalid model. Supported: ${validModels.join(", ")}`);

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
