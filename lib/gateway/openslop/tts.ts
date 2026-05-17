import type {
	TTSGenerateParams,
	VoiceInfo,
	VoiceSearchParams,
} from "@/lib/connectors/types";
import { OpenSlopAssetGateway } from "./base";

export class OpenSlopTTSGateway extends OpenSlopAssetGateway<TTSGenerateParams> {
	protected readonly path = "tts";

	async searchVoices(params: VoiceSearchParams): Promise<VoiceInfo[]> {
		const result = await this.client.get<{ voices: VoiceInfo[] }>(
			"/api/v1/tts/voices",
			params as Record<string, string>,
		);
		return result.voices;
	}
}
