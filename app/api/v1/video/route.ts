import { getVideoProvider } from "@/lib/api/providers";
import { VIDEO_MODELS } from "@/lib/connectors/video/openslop/models";
import { createApiHandler, createModelValidator } from "@/lib/api/handler";

export const POST = createApiHandler({
  validations: [
    { field: "prompt", required: true, type: "string" },
    { field: "model", validator: createModelValidator(VIDEO_MODELS) },
    {
      field: "referenceImage",
      validator: (value) => {
        if (
          typeof value === "string" &&
          !value.match(/^data:[a-z]+\/[a-z+.-]+;base64,/i)
        ) {
          return "referenceImage must be a data URI (e.g. data:image/png;base64,...)";
        }
        return null;
      },
    },
  ],
  handler: async (body) => {
    const provider = getVideoProvider();
    return provider.submit({
      prompt: body.prompt as string,
      model: body.model as string | undefined,
      referenceImage: body.referenceImage as string | undefined,
      duration: body.duration as number | undefined,
      width: body.width as number | undefined,
      height: body.height as number | undefined,
    });
  },
  errorMessage: "Video submission failed",
});
