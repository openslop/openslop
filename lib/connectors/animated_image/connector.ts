import { BaseAssetConnector } from "../asset-base";
import type { AttributeSchema } from "../attributes/schema";
import { ANIMATED_IMAGE_ATTRIBUTES } from "./attributes";
import type { AnimatedImageGenerateParams, AssetResult } from "../types";

export abstract class BaseAnimatedImageConnector extends BaseAssetConnector<
	AnimatedImageGenerateParams,
	AssetResult
> {
	readonly type = "image" as const;
	readonly assetKey = "image" as const;

	static attributesFor(_model?: string): AttributeSchema {
		return ANIMATED_IMAGE_ATTRIBUTES;
	}
}
