import { BaseConnector } from "../base";
import type { VideoConnector, VideoGenerateParams, VideoJob } from "../types";

export abstract class BaseVideoConnector
  extends BaseConnector<VideoGenerateParams, VideoJob>
  implements VideoConnector
{
  readonly type = "video" as const;

  protected abstract _generate(params: VideoGenerateParams): Promise<VideoJob>;

  abstract poll(jobId: string): Promise<VideoJob>;
}
