import type { AssetGateway } from "@/lib/gateway/base";
import { BaseAssetConnector } from "../asset-base";
import type { AttributeSchema } from "../attributes/schema";
import { TTS_ATTRIBUTES } from "./attributes";
import type {
	PluginContext,
	TTSConnector,
	TTSGenerateParams,
	TTSResult,
	VoiceInfo,
	VoiceSearchParams,
} from "../types";

export abstract class BaseTTSConnector<
	TGateway extends AssetGateway<TTSGenerateParams> =
		AssetGateway<TTSGenerateParams>,
>
	extends BaseAssetConnector<TTSGenerateParams, TTSResult, TGateway>
	implements TTSConnector
{
	readonly type = "tts" as const;
	readonly assetKey = "audio" as const;

	static attributesFor(_model?: string): AttributeSchema {
		return TTS_ATTRIBUTES;
	}

	abstract searchVoices(params: VoiceSearchParams): Promise<VoiceInfo[]>;

	protected pluginContext(): PluginContext<TTSGenerateParams, TTSResult> {
		return { searchVoices: (p) => this.searchVoices(p) };
	}
}
