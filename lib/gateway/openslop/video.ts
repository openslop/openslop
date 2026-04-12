import type { VideoGenerateParams } from "@/lib/connectors/types";
import type { VideoProviderResponse } from "@/lib/providers/video/base";
import { OpenSlopGatewayClient } from "./base";

export class OpenSlopVideoGateway extends OpenSlopGatewayClient<
  VideoGenerateParams,
  VideoProviderResponse
> {
  async generate(params: VideoGenerateParams): Promise<VideoProviderResponse> {
    return this.client.post<VideoProviderResponse>("/api/v1/video", params);
  }

  async poll(jobId: string): Promise<VideoProviderResponse> {
    return this.client.get<VideoProviderResponse>(`/api/v1/video/${jobId}`);
  }
}
