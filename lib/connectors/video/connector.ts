import type { BaseProvider } from "@/lib/providers/base";
import { BaseConnector } from "../base";
import type { VideoConnector, VideoGenerateParams, VideoJob } from "../types";

export abstract class BaseVideoConnector<
  TProvider extends BaseProvider<VideoGenerateParams, VideoJob> = BaseProvider<
    VideoGenerateParams,
    VideoJob
  >,
>
  extends BaseConnector<VideoGenerateParams, VideoJob, TProvider>
  implements VideoConnector
{
  readonly type = "video" as const;

  abstract poll(jobId: string): Promise<VideoJob>;
}
