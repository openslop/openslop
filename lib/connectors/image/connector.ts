import { BaseAssetConnector } from "../asset-base";
import type {
  AssetResult,
  ImageConnector,
  ImageGenerateParams,
} from "../types";

export abstract class BaseImageConnector
  extends BaseAssetConnector<ImageGenerateParams, AssetResult>
  implements ImageConnector
{
  readonly type = "image" as const;
  readonly resultKind = "image" as const;
}
