import { getImageProvider } from "@/lib/api/providers";
import { createRouteHandler, jsonResponse } from "@/lib/api/route-handler";
import { IMAGE_MODELS } from "@/lib/connectors/image/openslop/models";

export const POST = createRouteHandler({
  models: IMAGE_MODELS,
  getProvider: getImageProvider,
  label: "Image generation",
  handle: async (provider, body) => {
    const { prompt, model, width, height, format, referenceImage } = body;
    const result = await provider.generate({
      prompt,
      model,
      width,
      height,
      format,
      referenceImage,
    });
    return jsonResponse(result);
  },
});
