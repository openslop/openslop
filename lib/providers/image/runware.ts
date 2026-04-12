import type { ImageGenerateParams } from "@/lib/connectors/types";
import type { BundleFile } from "@/lib/api/asset-bundle";
import { BaseProvider, type WithMetadata } from "../base";
import { withRunware } from "../runware";

type RawImageResult = {
  data: string;
  format: string;
} & WithMetadata;

export class RunwareImage extends BaseProvider<
  ImageGenerateParams,
  RawImageResult
> {
  protected readonly blobConfig = { type: "image", provider: "runware" };
  private apiKey: string;

  constructor(apiKey: string) {
    super();
    this.apiKey = apiKey;
  }

  protected toFiles(r: RawImageResult): BundleFile[] {
    return [
      {
        key: "image",
        filename: `output.${r.format}`,
        data: Buffer.from(r.data, "base64"),
        contentType: `image/${r.format}`,
      },
    ];
  }

  protected async _generate(params: ImageGenerateParams) {
    return withRunware(this.apiKey, async (runware) => {
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
      };
    });
  }
}
