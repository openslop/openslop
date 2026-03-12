import { OpenSlopClient } from "@/lib/clients/openslop";
import type {
  TTSGenerateParams,
  TTSResult,
  VoiceInfo,
  VoiceSearchParams,
} from "@/lib/connectors/types";
import { BaseProvider } from "../base";

export class OpenSlopTTS extends BaseProvider<TTSGenerateParams, TTSResult> {
  private client: OpenSlopClient;

  constructor(baseUrl?: string) {
    super();
    this.client = new OpenSlopClient(baseUrl);
  }

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
