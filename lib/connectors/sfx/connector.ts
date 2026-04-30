import { BaseAssetConnector } from "../asset-base";
import type { AssetResult, SFXGenerateParams } from "../types";

export abstract class BaseSFXConnector extends BaseAssetConnector<
	SFXGenerateParams,
	AssetResult
> {
	readonly type = "sfx" as const;
	readonly assetKey = "audio" as const;
}
