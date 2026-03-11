import { OpenSlopClient } from "@/lib/clients/openslop";
import type { VideoGenerateParams, VideoJob } from "@/lib/connectors/types";

export class OpenSlopVideo {
  private client: OpenSlopClient;

  constructor(baseUrl?: string) {
    this.client = new OpenSlopClient(baseUrl);
  }

  async submit(params: VideoGenerateParams): Promise<VideoJob> {
    return this.client.post("/api/v1/video", params);
  }

  async poll(jobId: string): Promise<VideoJob> {
    return this.client.get(`/api/v1/video/${jobId}`);
  }
}
