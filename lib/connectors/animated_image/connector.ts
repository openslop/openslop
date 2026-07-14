import { BaseAssetConnector } from "../asset-base";
import type { AttributeSchema } from "../attributes/schema";
import { ANIMATED_IMAGE_ATTRIBUTES } from "./attributes";
import type { AnimatedImageGenerateParams, AssetResult } from "../types";

export abstract class BaseAnimatedImageConnector extends BaseAssetConnector<
	AnimatedImageGenerateParams,
	AssetResult
> {
	readonly type = "animated_image" as const;
	readonly assetKey = "image" as const;

	/** Animated images are generated through the image route, so their bundles land in the image namespace. */
	protected override get bundleType(): string {
		return "image";
	}

	static attributesFor(_model?: string): AttributeSchema {
		return ANIMATED_IMAGE_ATTRIBUTES;
	}
}
