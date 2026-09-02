import type { AssetBundle } from "@/lib/api/asset-bundle";
import { HttpTTSGateway } from "@/lib/gateway/http";
import { BaseAssetConnector } from "../asset-base";
import type { AttributeSchema } from "../attributes/schema";
import { TTS_ATTRIBUTES } from "./attributes";
import type {
	PluginContext,
	ResolvedConnectorConfig,
	TextTimestamp,
	TTSConnector,
	TTSGenerateParams,
	TTSResult,
	VoiceInfo,
	VoiceSearchParams,
	ModelRef,
} from "../types";

export class HttpTTSConnector
	extends BaseAssetConnector<TTSGenerateParams, TTSResult, HttpTTSGateway>
	implements TTSConnector
{
	readonly type = "tts" as const;
	readonly assetKey = "audio" as const;

	constructor(config: ResolvedConnectorConfig) {
		super(new HttpTTSGateway(config.model, config.baseUrl), config);
	}

	static attributesFor(_model: ModelRef): AttributeSchema {
		return TTS_ATTRIBUTES;
	}

	async searchVoices(params: VoiceSearchParams): Promise<VoiceInfo[]> {
		return this.gateway.searchVoices(params);
	}

	/** Speech carries the word timings the karaoke captions are drawn from. */
	async resolveBundle(bundle: AssetBundle): Promise<TTSResult> {
		return {
			...(await super.resolveBundle(bundle)),
			textTimestamps: await bundle.fetchJson<TextTimestamp[]>("timestamps"),
		};
	}

	protected pluginContext(): PluginContext<TTSGenerateParams, TTSResult> {
		return { searchVoices: (p) => this.searchVoices(p) };
	}
}
