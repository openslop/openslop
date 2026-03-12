import { Runware } from "@runware/sdk-js";
import type { VideoGenerateParams, VideoJob } from "@/lib/connectors/types";
import { BaseProvider } from "../base";
import { awaitCompletion } from "../poll";

export class RunwareVideo extends BaseProvider<VideoGenerateParams, VideoJob> {
  private apiKey: string;

  constructor(apiKey: string) {
    super();
    this.apiKey = apiKey;
  }

  async submit(params: VideoGenerateParams) {
    const runware = new Runware({ apiKey: this.apiKey });
    try {
      const result = await runware.videoInference({
        positivePrompt: params.prompt,
        model: params.model || "bytedance:2@2",
        width: params.width || 512,
        height: params.height || 512,
        duration: params.duration || 5,
        outputType: "URL",
        inputImage: params.referenceImage,
      });

      const video = Array.isArray(result) ? result[0] : result;
      return {
        jobId: video.taskUUID,
        status: video.status as
          | "queued"
          | "processing"
          | "completed"
          | "failed",
        resultUrl: video.videoURL,
      };
    } finally {
      runware.disconnect?.();
    }
  }

  async generate(params: VideoGenerateParams): Promise<VideoJob> {
    const job = await this.submit(params);
    return awaitCompletion((id) => this.poll(id), job.jobId);
  }

  async poll(jobId: string) {
    const runware = new Runware({ apiKey: this.apiKey });
    try {
      const results = await runware.getResponse<{
        taskUUID: string;
        status: string;
        videoURL?: string;
      }>({ taskUUID: jobId });

      const video = results?.[0];
      if (!video) throw new Error("Job not found");

      return {
        jobId: video.taskUUID,
        status: video.status as
          | "queued"
          | "processing"
          | "completed"
          | "failed",
        resultUrl: video.videoURL,
      };
    } finally {
      runware.disconnect?.();
    }
  }
}
