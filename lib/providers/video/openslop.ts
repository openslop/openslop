import type { BundleResponse } from "@/lib/api/asset-bundle";
import type { VideoGenerateParams } from "@/lib/connectors/types";
import { BaseOpenSlopProvider } from "../openslop-base";

export class OpenSlopVideo extends BaseOpenSlopProvider<
  VideoGenerateParams,
  BundleResponse
> {
  async generate(params: VideoGenerateParams): Promise<BundleResponse> {
    return this.client.post<BundleResponse>("/api/v1/video", params);
  }
}
