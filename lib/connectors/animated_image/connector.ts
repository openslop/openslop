import { BaseAssetConnector } from "../asset-base";
import type { AnimatedImageGenerateParams, AssetResult } from "../types";

export abstract class BaseAnimatedImageConnector extends BaseAssetConnector<
	AnimatedImageGenerateParams,
	AssetResult
> {
	readonly type = "image" as const;
	readonly assetKey = "image" as const;
}
