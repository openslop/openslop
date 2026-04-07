import type { BundleResponse } from "@/lib/api/asset-bundle";
import type { VideoGenerateParams, VideoJob } from "@/lib/connectors/types";
import { BaseProvider } from "../base";

const MOCK_JOB: VideoJob = {
  jobId: "mock-job",
  status: "completed",
  url: "/assets/video/mock/1/output.mp4",
};

export class MockVideo extends BaseProvider<
  VideoGenerateParams,
  BundleResponse
> {
  async generate(): Promise<BundleResponse> {
    await new Promise((r) => setTimeout(r, 2000 + Math.random() * 2000));
    return {
      id: "1",
      provider: "mock",
      result: { video: "output.mp4" },
      metadata: { durationSec: 5 },
    };
  }

  async submit(): Promise<VideoJob> {
    return MOCK_JOB;
  }

  async poll(): Promise<VideoJob> {
    return MOCK_JOB;
  }
}
