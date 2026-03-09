import { BaseVideoConnector } from "../connector";
import type {
  ModelInfo,
  VideoGenerateParams,
  VideoJob,
} from "@/lib/connectors/types";

export class OpenSlopVideo extends BaseVideoConnector {
  async listModels(): Promise<ModelInfo[]> {
    return [{ id: "openslop-default", name: "OpenSlop Default" }];
  }

  protected async _generate(_params: VideoGenerateParams): Promise<VideoJob> {
    return {
      jobId: "openslop-job-1",
      status: "completed",
      resultUrl: "https://example.com/placeholder.mp4",
    };
  }

  async poll(_jobId: string): Promise<VideoJob> {
    return {
      jobId: _jobId,
      status: "completed",
      resultUrl: "https://example.com/placeholder.mp4",
    };
  }
}
