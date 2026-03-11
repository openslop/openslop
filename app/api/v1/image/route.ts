import { getImageProvider } from "@/lib/api/providers";
import { IMAGE_MODELS } from "@/lib/connectors/image/openslop/models";
import { createApiHandler, createModelValidator } from "@/lib/api/handler";

export const POST = createApiHandler({
  validations: [
    { field: "prompt", required: true, type: "string" },
    { field: "model", validator: createModelValidator(IMAGE_MODELS) },
  ],
  handler: async (body) => {
    const provider = getImageProvider();
    return provider.generate({
      prompt: body.prompt as string,
      model: body.model as string | undefined,
      width: body.width as number | undefined,
      height: body.height as number | undefined,
    });
  },
  errorMessage: "Image generation failed",
});
