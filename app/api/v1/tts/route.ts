import { getTTSProvider } from "@/lib/api/providers";
import { TTS_MODELS } from "@/lib/connectors/tts/openslop/models";
import { createApiHandler, createModelValidator } from "@/lib/api/handler";

export const POST = createApiHandler({
  validations: [
    { field: "prompt", required: true, type: "string" },
    { field: "voiceId", required: true, type: "string" },
    { field: "model", validator: createModelValidator(TTS_MODELS) },
  ],
  handler: async (body) => {
    const provider = getTTSProvider();
    return provider.generate({
      prompt: body.prompt as string,
      voiceId: body.voiceId as string,
      model: body.model as string | undefined,
    });
  },
  errorMessage: "TTS generation failed",
});
