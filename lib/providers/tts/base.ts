import type {
	TTSGenerateParams,
	VoiceInfo,
	VoiceSearchParams,
} from "@/lib/connectors/types";
import type { AssetProvider } from "../base";

export interface TTSProvider extends AssetProvider<TTSGenerateParams> {
	search(params: VoiceSearchParams): Promise<VoiceInfo[]>;
	fetchVoicePreview(url: string): Promise<Response>;
}
