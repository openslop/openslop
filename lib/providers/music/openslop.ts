import { OpenSlopClient } from "@/lib/clients/openslop";
import type { MusicGenerateParams } from "@/lib/connectors/types";

export class OpenSlopMusic {
  private client: OpenSlopClient;

  constructor(baseUrl?: string) {
    this.client = new OpenSlopClient(baseUrl);
  }

  async generate(params: MusicGenerateParams): Promise<ArrayBuffer> {
    return this.client.postBinary("/api/v1/music", params);
  }
}
