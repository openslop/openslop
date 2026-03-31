import { BaseAssetConnector } from "../asset-base";
import type {
  AssetResult,
  VideoConnector,
  VideoGenerateParams,
  VideoJob,
} from "../types";

export abstract class BaseVideoConnector
  extends BaseAssetConnector<VideoGenerateParams, AssetResult>
  implements VideoConnector
{
  readonly type = "video" as const;
  readonly resultKind = "video" as const;

  abstract poll(jobId: string): Promise<VideoJob>;
}
