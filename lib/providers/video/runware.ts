import { Runware } from "@runware/sdk-js";

export class RunwareVideo {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async submit(params: {
    prompt: string;
    model?: string;
    referenceImage?: string;
    duration?: number;
    width?: number;
    height?: number;
  }) {
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
