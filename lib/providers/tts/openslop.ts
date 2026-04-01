import type { BundleResponse } from "@/lib/api/asset-bundle";
import type {
  TTSGenerateParams,
  VoiceInfo,
  VoiceSearchParams,
} from "@/lib/connectors/types";
import { BaseOpenSlopProvider } from "../openslop-base";

export class OpenSlopTTS extends BaseOpenSlopProvider<
  TTSGenerateParams,
  BundleResponse
> {
  async generate(params: TTSGenerateParams): Promise<BundleResponse> {
    return this.client.post<BundleResponse>("/api/v1/tts", params);
  }

  async searchVoices(params: VoiceSearchParams): Promise<VoiceInfo[]> {
    const result = await this.client.get<{ voices: VoiceInfo[] }>(
      "/api/v1/tts/voices",
      params as Record<string, string>,
    );
    return result.voices;
  }
}
