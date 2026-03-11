import { getSFXProvider } from "@/lib/api/providers";
import { SFX_MODELS } from "@/lib/connectors/sfx/openslop/models";
import { createApiHandler, createModelValidator } from "@/lib/api/handler";

export const POST = createApiHandler({
  validations: [
    { field: "prompt", required: true, type: "string" },
    { field: "model", validator: createModelValidator(SFX_MODELS) },
  ],
  handler: async (body) => {
    const provider = getSFXProvider();
    return provider.generate({
      prompt: body.prompt as string,
      model: body.model as string | undefined,
      durationSeconds: body.durationSeconds as number | undefined,
    });
  },
  errorMessage: "SFX generation failed",
});
