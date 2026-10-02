import type {
	VoicedTTSParams,
	VoiceInfo,
	VoiceSearchParams,
} from "@/lib/connectors/types";
import type { VendorParams } from "@/lib/connectors/models";
import type { AssetProvider } from "../base";

export type TTSRequest = VendorParams<VoicedTTSParams>;

export interface TTSProvider extends AssetProvider<TTSRequest> {
	search(params: VoiceSearchParams): Promise<VoiceInfo[]>;
	getVoice(voiceId: string): Promise<VoiceInfo | null>;
	fetchVoicePreview(url: string): Promise<Response>;
}
