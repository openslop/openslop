import { BaseAssetConnector } from "../asset-base";
import type { AttributeSchema } from "../attributes/schema";
import { SFX_ATTRIBUTES } from "./attributes";
import type { AssetResult, SFXGenerateParams } from "../types";

export abstract class BaseSFXConnector extends BaseAssetConnector<
	SFXGenerateParams,
	AssetResult
> {
	readonly type = "sfx" as const;
	readonly assetKey = "audio" as const;

	static attributesFor(_model?: string): AttributeSchema {
		return SFX_ATTRIBUTES;
	}
}
