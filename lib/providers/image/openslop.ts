import { OpenSlopClient } from "@/lib/clients/openslop";
import type { ImageGenerateParams, ImageResult } from "@/lib/connectors/types";
import { BaseProvider } from "../base";

export class OpenSlopImage extends BaseProvider<
  ImageGenerateParams,
  ImageResult
> {
  private client: OpenSlopClient;

  constructor(baseUrl?: string) {
    super();
    this.client = new OpenSlopClient(baseUrl);
  }

  async generate(params: ImageGenerateParams): Promise<ImageResult> {
    return this.client.post("/api/v1/image", params);
  }
}
