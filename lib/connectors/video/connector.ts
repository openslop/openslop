import { BaseAssetConnector } from "../asset-base";
import type { AssetResult, VideoGenerateParams } from "../types";

export abstract class BaseVideoConnector extends BaseAssetConnector<
	VideoGenerateParams,
	AssetResult
> {
	readonly type = "video" as const;
	readonly assetKey = "video" as const;
}
