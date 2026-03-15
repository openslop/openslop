import type { VideoGenerateParams, VideoJob } from "@/lib/connectors/types";
import { BaseOpenSlopProvider } from "../openslop-base";
import { awaitCompletion } from "../poll";

export class OpenSlopVideo extends BaseOpenSlopProvider<
  VideoGenerateParams,
  VideoJob
> {
  async generate(params: VideoGenerateParams): Promise<VideoJob> {
    const job = await this.submit(params);
    return awaitCompletion((id) => this.poll(id), job.jobId);
  }

  async submit(params: VideoGenerateParams): Promise<VideoJob> {
    return this.client.post("/api/v1/video", params);
  }

  async poll(jobId: string): Promise<VideoJob> {
    return this.client.get(`/api/v1/video/${jobId}`);
  }
}
