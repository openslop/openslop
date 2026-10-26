import type { AssetBundle } from "@/lib/api/asset-bundle";
import { HttpTTSGateway } from "@/lib/gateway/http";
import { readTimestamps } from "@/lib/providers/timestamps-file";
import { BaseAssetConnector } from "../asset-base";
import type { AttributeSchema } from "../attributes/schema";
import { TTS_ATTRIBUTES } from "./attributes";
import {
	type HostedVoicePreview,
	type ResolvedConnectorConfig,
	type TTSConnector,
	type TTSGenerateParams,
	type TTSResult,
	type VoiceInfo,
	type VoiceSearchParams,
	type ModelRef,
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
		const words = await readTimestamps(bundle);
		return {
			...(await super.resolveBundle(bundle)),
			textTimestamps: words,
			originalTextTimestamps: words,
		};
	}
}
