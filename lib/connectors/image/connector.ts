import { BaseAssetConnector } from "../asset-base";
import type { AttributeSchema } from "../attributes/schema";
import { IMAGE_ATTRIBUTES } from "./attributes";
import type { AssetResult, ImageGenerateParams } from "../types";

export abstract class BaseImageConnector extends BaseAssetConnector<
	ImageGenerateParams,
	AssetResult
> {
	readonly type = "image" as const;
	readonly assetKey = "image" as const;

	static attributesFor(_model?: string): AttributeSchema {
		return IMAGE_ATTRIBUTES;
	}
}
