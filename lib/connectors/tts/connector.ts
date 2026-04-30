import { BaseAssetConnector } from "../asset-base";
import type {
	PluginContext,
	TTSConnector,
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
}
