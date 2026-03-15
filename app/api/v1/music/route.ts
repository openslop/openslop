import { getMusicProvider } from "@/lib/api/providers";
import { createRouteHandler, audioResponse } from "@/lib/api/route-handler";
import { MUSIC_MODELS } from "@/lib/connectors/music/openslop/models";

export const POST = createRouteHandler({
  models: MUSIC_MODELS,
  getProvider: getMusicProvider,
  label: "Music generation",
  handle: async (provider, body) => {
    const { prompt, model, durationSeconds } = body;
    const buffer = await provider.generate({
      prompt,
      model,
      durationSeconds,
    });
    return audioResponse(buffer);
  },
});
