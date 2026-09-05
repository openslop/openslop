import type {
	TTSGenerateParams,
	VoiceInfo,
	VoiceSearchParams,
} from "@/lib/connectors/types";
import type { VendorParams } from "@/lib/connectors/models";
import type { AssetProvider } from "../base";

export interface TTSProvider extends AssetProvider<
	VendorParams<TTSGenerateParams>
> {
	search(params: VoiceSearchParams): Promise<VoiceInfo[]>;
	fetchVoicePreview(url: string): Promise<Response>;
}
