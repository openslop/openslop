import { OpenSlopClient } from "@/lib/clients/openslop";
import type { SFXGenerateParams } from "@/lib/connectors/types";

export class OpenSlopSFX {
  private client: OpenSlopClient;

  constructor(baseUrl?: string) {
    this.client = new OpenSlopClient(baseUrl);
  }

  async generate(params: SFXGenerateParams): Promise<ArrayBuffer> {
    return this.client.postBinary("/api/v1/sfx", params);
  }
}
