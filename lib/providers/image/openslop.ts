import type { ImageGenerateParams, ImageResult } from "@/lib/connectors/types";
import { BaseOpenSlopProvider } from "../openslop-base";

export class OpenSlopImage extends BaseOpenSlopProvider<
  ImageGenerateParams,
  ImageResult
> {
  async generate(params: ImageGenerateParams): Promise<ImageResult> {
    return this.client.post("/api/v1/image", params);
  }
}
