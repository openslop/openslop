import { HttpAssetGateway } from "@/lib/gateway/http";
import { BaseAssetConnector } from "../asset-base";
import type { AttributeSchema } from "../attributes/schema";
import { MUSIC_ATTRIBUTES } from "./attributes";
import type {
	AssetResult,
	MusicGenerateParams,
	ResolvedConnectorConfig,
} from "../types";

export class HttpMusicConnector extends BaseAssetConnector<
	MusicGenerateParams,
	AssetResult
> {
	readonly type = "music" as const;
	readonly assetKey = "audio" as const;

	constructor(config: ResolvedConnectorConfig) {
		super(
			new HttpAssetGateway(config.provider, "music", config.baseUrl),
			config,
		);
	}

	static attributesFor(_model?: string): AttributeSchema {
		return MUSIC_ATTRIBUTES;
	}
}
