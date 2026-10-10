import type { AssetBundle } from "@/lib/api/assetBundle";
import { HttpTTSGateway } from "@/lib/gateway/http";
import { BaseAssetConnector } from "../assetBase";
import type { AttributeSchema } from "../attributes/schema";
import { TTS_ATTRIBUTES } from "./attributes";
import type {
	HostedVoicePreview,
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
		super(new HttpTTSGateway(config.model), config);
	}

	static attributesFor(_model: ModelRef): AttributeSchema {
		return TTS_ATTRIBUTES;
	}

	async searchVoices(params: VoiceSearchParams): Promise<VoiceInfo[]> {
		return this.gateway.searchVoices(params);
	}

	async voicePreview(voiceId: string): Promise<HostedVoicePreview> {
		return this.gateway.voicePreview(voiceId);
	}

	/** Speech carries the word timings the karaoke captions are drawn from. */
	async resolveBundle(bundle: AssetBundle): Promise<TTSResult> {
		return {
			...(await super.resolveBundle(bundle)),
			textTimestamps: await bundle.fetchJson<TextTimestamp[]>("timestamps"),
		};
	}
}
