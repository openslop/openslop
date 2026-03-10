import { NextRequest, NextResponse } from "next/server";
import { getSFXProvider } from "@/lib/api/providers";
import { badRequest, serverError } from "@/lib/api/response";
import { SFX_MODELS } from "@/lib/connectors/sfx/openslop/models";
import { logger } from "@/lib/api/logger";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, model, durationSeconds } = body;

    if (!prompt || typeof prompt !== "string")
      return badRequest("prompt is required");
    if (model && !SFX_MODELS.includes(model))
      return badRequest(`Invalid model. Supported: ${SFX_MODELS.join(", ")}`);

    const provider = getSFXProvider();
    const result = await provider.generate({ prompt, model, durationSeconds });

    return NextResponse.json(result);
  } catch (error) {
    logger.error(error, "SFX generation failed");
    return serverError("SFX generation failed");
  }
}
