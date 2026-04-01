import { getMusicProvider } from "@/lib/api/providers";
import { createRouteHandler, jsonResponse } from "@/lib/api/route-handler";
import { MUSIC_MODELS } from "@/lib/connectors/music/openslop/models";

export const POST = createRouteHandler({
  models: MUSIC_MODELS,
  getProvider: getMusicProvider,
  label: "Music generation",
  handle: async (provider, body) => {
    const { prompt, model, durationSeconds } = body;
    const result = await provider.generate({
      prompt,
      model,
      durationSeconds,
    });
    return jsonResponse(result);
  },
});
