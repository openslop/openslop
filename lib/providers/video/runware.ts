import type {
  VideoGenerateParams,
  VideoJob,
  VideoJobStatus,
} from "@/lib/connectors/types";
import { BaseProvider } from "../base";
import { awaitCompletion } from "../poll";
import { withRunware } from "../runware";

function toVideoJob(video: {
  taskUUID: string;
  status: string;
  videoURL?: string;
}): VideoJob {
  return {
    jobId: video.taskUUID,
    status: video.status as VideoJobStatus,
    url: video.videoURL,
  };
}

export class RunwareVideo extends BaseProvider<VideoGenerateParams, VideoJob> {
  private apiKey: string;

  constructor(apiKey: string) {
    super();
    this.apiKey = apiKey;
  }

  async submit(params: VideoGenerateParams) {
    return withRunware(this.apiKey, async (runware) => {
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
      return toVideoJob(video);
    });
  }

  async generate(params: VideoGenerateParams): Promise<VideoJob> {
    const job = await this.submit(params);
    return awaitCompletion((id) => this.poll(id), job.jobId);
  }

  async poll(jobId: string) {
    return withRunware(this.apiKey, async (runware) => {
      const results = await runware.getResponse<{
        taskUUID: string;
        status: string;
        videoURL?: string;
      }>({ taskUUID: jobId });

      const video = results?.[0];
      if (!video) throw new Error("Job not found");
      return toVideoJob(video);
    });
  }
}
