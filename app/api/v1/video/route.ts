import { getVideoProvider } from "@/lib/api/providers";
import { createRouteHandler, jsonResponse } from "@/lib/api/route-handler";
import { VIDEO_MODELS } from "@/lib/connectors/video/openslop/models";

export const POST = createRouteHandler({
  models: VIDEO_MODELS,
  getProvider: getVideoProvider,
  label: "Video generation",
  handle: async (provider, body) => {
    const { prompt, model, referenceImage, duration, width, height } = body;
    const result = await provider.generate({
      prompt,
      model,
      referenceImage,
      duration,
      width,
      height,
    });
    return jsonResponse(result);
  },
});
