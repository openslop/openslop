import type { VideoGenerateParams, VideoJob } from "@/lib/connectors/types";
import { BaseProvider } from "../base";

const MOCK_JOB: VideoJob = {
  jobId: "mock-job",
  status: "completed",
  resultUrl: "/mock/placeholder.mp4",
};

export class MockVideo extends BaseProvider<VideoGenerateParams, VideoJob> {
  async generate(): Promise<VideoJob> {
    return MOCK_JOB;
  }

  async submit(): Promise<VideoJob> {
    return MOCK_JOB;
  }

  async poll(): Promise<VideoJob> {
    return MOCK_JOB;
  }
}
