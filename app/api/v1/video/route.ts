import { getVideoProvider } from "@/lib/api/providers";
import { badRequest } from "@/lib/api/response";
import { createRouteHandler, jsonResponse } from "@/lib/api/route-handler";
import { VIDEO_MODELS } from "@/lib/connectors/video/openslop/models";

export const POST = createRouteHandler({
  models: VIDEO_MODELS,
  getProvider: getVideoProvider,
  label: "Video submission",
  extraValidation: (body) => {
    const { referenceImage } = body;
    if (
      referenceImage &&
      (typeof referenceImage !== "string" ||
        !String(referenceImage).match(/^data:[a-z]+\/[a-z+.-]+;base64,/i))
    )
      return badRequest(
        "referenceImage must be a data URI (e.g. data:image/png;base64,...)",
      );
    return null;
  },
  handle: async (provider, body) => {
    const { prompt, model, referenceImage, duration, width, height } = body;
    const result = await provider.submit({
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
