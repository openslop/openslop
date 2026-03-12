import { BaseTTSConnector } from "../connector";
import { OpenSlopTTS as OpenSlopTTSProvider } from "@/lib/providers/tts/openslop";
import type {
  ConnectorConfig,
  ModelInfo,
  VoiceInfo,
  VoiceSearchParams,
} from "@/lib/connectors/types";
import { TTS_MODELS } from "./models";

export class OpenSlopTTS extends BaseTTSConnector<OpenSlopTTSProvider> {
  constructor(config: ConnectorConfig) {
    super(new OpenSlopTTSProvider(config.baseUrl), config);
  }

  async listModels(): Promise<ModelInfo[]> {
    return TTS_MODELS.map((id) => ({ id, name: id }));
  }

  async searchVoices(params: VoiceSearchParams): Promise<VoiceInfo[]> {
    return this.provider.searchVoices(params);
  }
}
