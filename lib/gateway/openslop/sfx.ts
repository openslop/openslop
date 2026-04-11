import type { BundleResponse } from "@/lib/api/asset-bundle";
import type { SFXGenerateParams } from "@/lib/connectors/types";
import { OpenSlopGatewayClient } from "./base";

export class OpenSlopSFXGateway extends OpenSlopGatewayClient<
  SFXGenerateParams,
  BundleResponse
> {
  async generate(params: SFXGenerateParams): Promise<BundleResponse> {
    return this.client.post<BundleResponse>("/api/v1/sfx", params);
  }
}
