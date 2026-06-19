import type { AssetBundle } from "@/lib/api/asset-bundle";
import { BaseTTSConnector } from "../connector";
import { OpenSlopTTSGateway } from "@/lib/gateway/openslop/tts";
import type {
	ConnectorConfig,
	TextTimestamp,
	TTSResult,
	VoiceInfo,
	VoiceSearchParams,
} from "@/lib/connectors/types";

export class OpenSlopTTS extends BaseTTSConnector<OpenSlopTTSGateway> {
	constructor(config: ConnectorConfig) {
		super(new OpenSlopTTSGateway(config.baseUrl), config);
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
