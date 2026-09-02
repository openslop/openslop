import { HttpAssetGateway } from "@/lib/gateway/http";
import { BaseAssetConnector } from "../asset-base";
import type { AttributeSchema } from "../attributes/schema";
import { ANIMATED_IMAGE_ATTRIBUTES } from "./attributes";
import type {
	AnimatedImageGenerateParams,
	AssetResult,
	ResolvedConnectorConfig,
} from "../types";

/**
 * Animating a still is a video generation, so this is a video connector with its
 * own attribute schema rather than a chain over an image one. The frame it
 * animates comes from the element's `:still` dependency.
 */
export class HttpAnimatedImageConnector extends BaseAssetConnector<
	AnimatedImageGenerateParams,
	AssetResult
> {
	readonly type = "animated_image" as const;
	readonly assetKey = "video" as const;

	constructor(config: ResolvedConnectorConfig) {
		super(new HttpAssetGateway(config.model, "video", config.baseUrl), config);
	}

	static attributesFor(_model?: string): AttributeSchema {
		return ANIMATED_IMAGE_ATTRIBUTES;
	}
}
