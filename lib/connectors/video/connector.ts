import { BaseAssetConnector } from "../asset-base";
import type { AttributeSchema } from "../attributes/schema";
import { VIDEO_ATTRIBUTES } from "./attributes";
import type { AssetResult, VideoGenerateParams } from "../types";

export abstract class BaseVideoConnector extends BaseAssetConnector<
	VideoGenerateParams,
	AssetResult
> {
	readonly type = "video" as const;
	readonly assetKey = "video" as const;

	static attributesFor(_model?: string): AttributeSchema {
		return VIDEO_ATTRIBUTES;
	}
}
