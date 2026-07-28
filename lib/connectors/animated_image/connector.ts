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

	static attributesFor(_model?: string): AttributeSchema {
		return ANIMATED_IMAGE_ATTRIBUTES;
	}

	// The still comes from this element's `:still` dependency node; this connector
	// only hands it to `video-chain`, which animates it.
	protected async _generate(
		params: AnimatedImageGenerateParams,
	): Promise<AssetResult> {
		const imageUrl = params.frameImages?.[0];
		if (!imageUrl) {
			throw new Error("animated_image expected a still frame dependency");
		}
		return { imageUrl, durationSec: 0 };
	}
}
