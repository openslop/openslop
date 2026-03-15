import { getTTSProvider } from "@/lib/api/providers";
import { badRequest } from "@/lib/api/response";
import { createRouteHandler, jsonResponse } from "@/lib/api/route-handler";
import { TTS_MODELS } from "@/lib/connectors/tts/openslop/models";

export const POST = createRouteHandler({
  models: TTS_MODELS,
  getProvider: getTTSProvider,
  label: "TTS generation",
  extraValidation: (body) => {
    if (!body.voiceId || typeof body.voiceId !== "string")
      return badRequest("voiceId is required");
    return null;
  },
  handle: async (provider, body) => {
    const { prompt, voiceId, model, speed, volume, format } = body;
    const result = await provider.generate({
      prompt,
      voiceId,
      model,
      speed,
      volume,
      format,
    });
    return jsonResponse(result);
  },
});
