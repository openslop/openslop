import { NextRequest, NextResponse } from "next/server";
import { getVideoProvider } from "@/lib/api/providers";
import { badRequest, serverError } from "@/lib/api/response";
import { VIDEO_MODELS } from "@/lib/connectors/video/openslop/models";
import { logger } from "@/lib/api/logger";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, model, referenceImage, duration, width, height } = body;

    if (!prompt || typeof prompt !== "string")
      return badRequest("prompt is required");
    if (model && !VIDEO_MODELS.includes(model))
      return badRequest(`Invalid model. Supported: ${VIDEO_MODELS.join(", ")}`);
    if (
      referenceImage &&
      (typeof referenceImage !== "string" ||
        !referenceImage.match(/^data:[a-z]+\/[a-z+.-]+;base64,/i))
    )
      return badRequest(
        "referenceImage must be a data URI (e.g. data:image/png;base64,...)",
      );

    const provider = getVideoProvider();
    const result = await provider.submit({
      prompt,
      model,
      referenceImage,
      duration,
      width,
      height,
    });

    return NextResponse.json(result);
  } catch (error) {
    logger.error(error, "Video submission failed");
    return serverError("Video submission failed");
  }
}
