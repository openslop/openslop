import { BaseImageConnector } from "../connector";
import type {
  ImageGenerateParams,
  ImageResult,
  ModelInfo,
} from "@/lib/connectors/types";

export class OpenSlopImage extends BaseImageConnector {
  async listModels(): Promise<ModelInfo[]> {
    return [{ id: "openslop-default", name: "OpenSlop Default" }];
  }

  protected async _generate(params: ImageGenerateParams): Promise<ImageResult> {
    return {
      data: "placeholder-base64-data",
      format: params.format ?? "png",
      width: params.width ?? 512,
      height: params.height ?? 512,
      type: "base64",
    };
  }
}
