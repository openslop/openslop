import type { MusicGenerateParams } from "@/lib/connectors/types";
import { BaseOpenSlopProvider } from "../openslop-base";

export class OpenSlopMusic extends BaseOpenSlopProvider<
  MusicGenerateParams,
  ArrayBuffer
> {
  async generate(params: MusicGenerateParams): Promise<ArrayBuffer> {
    return this.client.postBinary("/api/v1/music", params);
  }
}
