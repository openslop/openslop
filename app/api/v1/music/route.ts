import { getMusicProvider } from "@/lib/api/providers";
import { MUSIC_MODELS } from "@/lib/connectors/music/openslop/models";
import { createApiHandler, createModelValidator } from "@/lib/api/handler";

export const POST = createApiHandler({
  validations: [
    { field: "prompt", required: true, type: "string" },
    { field: "model", validator: createModelValidator(MUSIC_MODELS) },
  ],
  handler: async (body) => {
    const provider = getMusicProvider();
    return provider.generate({
      prompt: body.prompt as string,
      model: body.model as string | undefined,
      durationSeconds: body.durationSeconds as number | undefined,
    });
  },
  errorMessage: "Music generation failed",
});
