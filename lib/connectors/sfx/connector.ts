import { HttpAssetGateway } from "@/lib/gateway/http";
import { BaseAssetConnector } from "../asset-base";
import type { AttributeSchema } from "../attributes/schema";
import { SFX_ATTRIBUTES } from "./attributes";
import type {
	AssetResult,
	ResolvedConnectorConfig,
	SFXGenerateParams,
} from "../types";

export class HttpSFXConnector extends BaseAssetConnector<
	SFXGenerateParams,
	AssetResult
> {
	readonly type = "sfx" as const;
	readonly assetKey = "audio" as const;

	constructor(config: ResolvedConnectorConfig) {
		super(new HttpAssetGateway(config.provider, "sfx", config.baseUrl), config);
	}

	static attributesFor(_model?: string): AttributeSchema {
		return SFX_ATTRIBUTES;
	}
}
