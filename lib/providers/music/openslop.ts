import { OpenSlopClient } from "@/lib/clients/openslop";
import type { MusicGenerateParams } from "@/lib/connectors/types";
import { BaseProvider } from "../base";

export class OpenSlopMusic extends BaseProvider<
  MusicGenerateParams,
  ArrayBuffer
> {
  private client: OpenSlopClient;

  constructor(baseUrl?: string) {
    super();
    this.client = new OpenSlopClient(baseUrl);
  }

  async generate(params: MusicGenerateParams): Promise<ArrayBuffer> {
    return this.client.postBinary("/api/v1/music", params);
  }
}
