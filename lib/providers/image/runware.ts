import { Runware } from "@runware/sdk-js";
import type { ImageGenerateParams } from "@/lib/connectors/types";

export class RunwareImage {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generate(params: ImageGenerateParams) {
    const runware = new Runware({ apiKey: this.apiKey });
    try {
      const results = await runware.imageInference({
        positivePrompt: params.prompt,
        model: params.model || "runware:z-image@turbo",
        width: params.width || 512,
        height: params.height || 512,
        outputType: "base64Data",
        numberResults: 1,
      });

      const image = results?.[0];
      if (!image?.imageBase64Data) throw new Error("No image data returned");

      return {
        data: image.imageBase64Data,
        format: "png" as const,
        width: params.width || 512,
        height: params.height || 512,
      };
    } finally {
      runware.disconnect?.();
    }
  }
}
