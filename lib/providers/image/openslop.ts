import { OpenSlopClient } from "@/lib/clients/openslop";
import type { ImageGenerateParams, ImageResult } from "@/lib/connectors/types";

export class OpenSlopImage {
  private client: OpenSlopClient;

  constructor(baseUrl?: string) {
    this.client = new OpenSlopClient(baseUrl);
  }

  async generate(params: ImageGenerateParams): Promise<ImageResult> {
    return this.client.post("/api/v1/image", params);
  }
}
