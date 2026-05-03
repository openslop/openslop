import { BaseAssetConnector } from "../asset-base";
import type { AssetResult, ImageGenerateParams } from "../types";

export abstract class BaseImageConnector extends BaseAssetConnector<
	ImageGenerateParams,
	AssetResult
> {
	readonly type = "image" as const;
	readonly assetKey = "image" as const;
}
