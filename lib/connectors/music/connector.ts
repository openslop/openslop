import { BaseAssetConnector } from "../asset-base";
import type {
  AssetResult,
  MusicConnector,
  MusicGenerateParams,
} from "../types";

export abstract class BaseMusicConnector
  extends BaseAssetConnector<MusicGenerateParams, AssetResult>
  implements MusicConnector
{
  readonly type = "music" as const;
  readonly assetKey = "audio" as const;
}
