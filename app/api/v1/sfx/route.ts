import { getSFXProvider } from "@/lib/api/providers";
import { createRouteHandler, jsonResponse } from "@/lib/api/route-handler";
import { SFX_MODELS } from "@/lib/connectors/sfx/openslop/models";

export const POST = createRouteHandler({
  models: SFX_MODELS,
  getProvider: getSFXProvider,
  label: "SFX generation",
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
