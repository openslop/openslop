import { BaseAssetConnector } from "../asset-base";
import type {
	TTSConnector,
	TTSConnectorParams,
	TTSGenerateParams,
	TTSResult,
	VoiceInfo,
	VoiceSearchParams,
} from "../types";

export abstract class BaseTTSConnector
	extends BaseAssetConnector<TTSGenerateParams, TTSResult>
	implements TTSConnector
{
	readonly type = "tts" as const;
	readonly assetKey = "audio" as const;

	abstract searchVoices(params: VoiceSearchParams): Promise<VoiceInfo[]>;

	async generate(params: TTSConnectorParams): Promise<TTSResult> {
		let { voiceId } = params;
		if (!voiceId) {
			const voices = await this.searchVoices({
				query: params.query,
				gender: params.gender,
				accent: params.accent,
				language: params.language,
			});
			if (!voices.length) throw new Error("No matching voice found");
			voiceId = voices[0].id;
		}
		return super.generate({
			prompt: params.prompt,
			voiceId,
			model: params.model,
		});
	}
}
