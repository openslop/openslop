import { BaseTTSConnector } from "../connector";
import { OpenSlopTTS as OpenSlopTTSProvider } from "@/lib/providers/tts/openslop";
import type {
  ConnectorConfig,
  ModelInfo,
  TTSGenerateParams,
  TTSResult,
  VoiceInfo,
  VoiceSearchParams,
} from "@/lib/connectors/types";
import { TTS_MODELS } from "./models";

export class OpenSlopTTS extends BaseTTSConnector {
  private provider: OpenSlopTTSProvider;

  constructor(config: ConnectorConfig) {
    super(config);
    this.provider = new OpenSlopTTSProvider(config.baseUrl);
  }

  async listModels(): Promise<ModelInfo[]> {
    return TTS_MODELS.map((id) => ({ id, name: id }));
  }

  protected async _generate(params: TTSGenerateParams): Promise<TTSResult> {
    return this.provider.generate(params);
  }

  async searchVoices(params: VoiceSearchParams): Promise<VoiceInfo[]> {
    return this.provider.searchVoices(params);
  }
}
