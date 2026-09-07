import { HttpAssetGateway } from "@/lib/gateway/http";
import { BaseAssetConnector } from "../asset-base";
import type { AttributeSchema } from "../attributes/schema";
import { videoAttributesFor } from "./attributes";
import type {
	AssetResult,
	ResolvedConnectorConfig,
	VideoGenerateParams,
	ModelRef,
} from "../types";

export class HttpVideoConnector extends BaseAssetConnector<
	VideoGenerateParams,
	AssetResult
> {
	readonly type = "video" as const;
	readonly assetKey = "video" as const;

	constructor(config: ResolvedConnectorConfig) {
		super(new HttpAssetGateway(config.model, "video", config.baseUrl), config);
	}

	static attributesFor(model: ModelRef): AttributeSchema {
		return videoAttributesFor(model);
	}
}
