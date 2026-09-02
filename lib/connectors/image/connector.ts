import { HttpAssetGateway } from "@/lib/gateway/http";
import { BaseAssetConnector } from "../asset-base";
import type { AttributeSchema } from "../attributes/schema";
import { IMAGE_ATTRIBUTES } from "./attributes";
import type {
	AssetResult,
	ImageGenerateParams,
	ResolvedConnectorConfig,
} from "../types";

export class HttpImageConnector extends BaseAssetConnector<
	ImageGenerateParams,
	AssetResult
> {
	readonly type = "image" as const;
	readonly assetKey = "image" as const;

	constructor(config: ResolvedConnectorConfig) {
		super(new HttpAssetGateway(config.model, "image", config.baseUrl), config);
	}

	static attributesFor(_model?: string): AttributeSchema {
		return IMAGE_ATTRIBUTES;
	}
}
