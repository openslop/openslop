import { NextRequest, NextResponse } from "next/server";
import { getImageProvider } from "@/lib/api/providers";
import { badRequest, serverError } from "@/lib/api/response";
import { IMAGE_MODELS } from "@/lib/connectors/image/openslop/models";
import { logger } from "@/lib/api/logger";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, model, width, height } = body;

    if (!prompt || typeof prompt !== "string")
      return badRequest("prompt is required");
    if (model && !IMAGE_MODELS.includes(model))
      return badRequest(`Invalid model. Supported: ${IMAGE_MODELS.join(", ")}`);

    const provider = getImageProvider();
    const result = await provider.generate({ prompt, model, width, height });

    return NextResponse.json(result);
  } catch (error) {
    logger.error(error, "Image generation failed");
    return serverError("Image generation failed");
  }
}
