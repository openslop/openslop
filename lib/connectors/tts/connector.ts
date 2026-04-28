import { BaseAssetConnector } from "../asset-base";
import type {
	PluginContext,
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

	protected pluginContext(): PluginContext<TTSGenerateParams, TTSResult> {
		return { searchVoices: (p) => this.searchVoices(p) };
	}

	async generate(params: TTSConnectorParams): Promise<TTSResult> {
		return super.generate(params as unknown as TTSGenerateParams);
	}
}
