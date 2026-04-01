import type { BundleResponse } from "@/lib/api/asset-bundle";
import type { MusicGenerateParams } from "@/lib/connectors/types";
import { BaseOpenSlopProvider } from "../openslop-base";

export class OpenSlopMusic extends BaseOpenSlopProvider<
  MusicGenerateParams,
  BundleResponse
> {
  async generate(params: MusicGenerateParams): Promise<BundleResponse> {
    return this.client.post<BundleResponse>("/api/v1/music", params);
  }
}
