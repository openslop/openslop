import type { AssetBundle } from "@/lib/api/asset-bundle";
import { BaseTTSConnector } from "../connector";
import { ThirdPartyTTSGateway } from "@/lib/gateway/thirdparty/tts";
import type {
	ConnectorConfig,
	TextTimestamp,
	TTSResult,
	VoiceInfo,
	VoiceSearchParams,
} from "@/lib/connectors/types";

export class ThirdPartyTTS extends BaseTTSConnector<ThirdPartyTTSGateway> {
	constructor(config: ConnectorConfig) {
		super(new ThirdPartyTTSGateway(config.provider, config.baseUrl), config);
	}

	async searchVoices(params: VoiceSearchParams): Promise<VoiceInfo[]> {
		return this.gateway.searchVoices(params);
	}

	async resolveBundle(bundle: AssetBundle): Promise<TTSResult> {
		return {
			...(await super.resolveBundle(bundle)),
			textTimestamps: await bundle.fetchJson<TextTimestamp[]>("timestamps"),
		};
	}
}
