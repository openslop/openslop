import { BaseAssetConnector } from "../asset-base";
import type { AssetResult, SFXConnector, SFXGenerateParams } from "../types";

export abstract class BaseSFXConnector
  extends BaseAssetConnector<SFXGenerateParams, AssetResult>
  implements SFXConnector
{
  readonly type = "sfx" as const;
  readonly assetKey = "audio" as const;
}
