import { BaseAssetConnector } from "../asset-base";
import type { AssetResult, MusicGenerateParams } from "../types";

export abstract class BaseMusicConnector extends BaseAssetConnector<
	MusicGenerateParams,
	AssetResult
> {
	readonly type = "music" as const;
	readonly assetKey = "audio" as const;
}
