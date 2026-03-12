import { OpenSlopClient } from "@/lib/clients/openslop";
import type { SFXGenerateParams } from "@/lib/connectors/types";
import { BaseProvider } from "../base";

export class OpenSlopSFX extends BaseProvider<SFXGenerateParams, ArrayBuffer> {
  private client: OpenSlopClient;

  constructor(baseUrl?: string) {
    super();
    this.client = new OpenSlopClient(baseUrl);
  }

  async generate(params: SFXGenerateParams): Promise<ArrayBuffer> {
    return this.client.postBinary("/api/v1/sfx", params);
  }
}
