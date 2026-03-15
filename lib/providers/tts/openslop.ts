import type {
  TTSGenerateParams,
  TTSResult,
  VoiceInfo,
  VoiceSearchParams,
} from "@/lib/connectors/types";
import { BaseOpenSlopProvider } from "../openslop-base";

export class OpenSlopTTS extends BaseOpenSlopProvider<
  TTSGenerateParams,
  TTSResult
> {
  async generate(params: TTSGenerateParams): Promise<TTSResult> {
    return this.client.post("/api/v1/tts", params);
  }

  async searchVoices(params: VoiceSearchParams): Promise<VoiceInfo[]> {
    const result = await this.client.get<{ voices: VoiceInfo[] }>(
      "/api/v1/tts/voices",
      params as Record<string, string>,
    );
    return result.voices;
  }
}
