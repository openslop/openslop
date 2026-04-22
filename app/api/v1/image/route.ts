import { NextResponse } from "next/server";
import { getImageProvider } from "@/lib/api/providers";
import { createRouteHandler } from "@/lib/api/route-handler";
import { IMAGE_MODELS } from "@/lib/connectors/image/openslop/models";

export const POST = createRouteHandler({
  models: IMAGE_MODELS,
  getProvider: getImageProvider,
  label: "Image generation",
  handle: async (provider, body) => {
    const { prompt, model, format, width, height, referenceImage } = body;
    const result = await provider.generate({
      prompt,
      model,
      format,
      width,
      height,
      referenceImage,
    });
    return NextResponse.json(result);
  },
});
