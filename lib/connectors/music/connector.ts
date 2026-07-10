import { BaseAssetConnector } from "../asset-base";
import type { AttributeSchema } from "../attributes/schema";
import { MUSIC_ATTRIBUTES } from "./attributes";
import type { AssetResult, MusicGenerateParams } from "../types";

export abstract class BaseMusicConnector extends BaseAssetConnector<
	MusicGenerateParams,
	AssetResult
> {
	readonly type = "music" as const;
	readonly assetKey = "audio" as const;

	static attributesFor(_model?: string): AttributeSchema {
		return MUSIC_ATTRIBUTES;
	}
}
