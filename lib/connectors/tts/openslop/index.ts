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
    return Object.entries(TTS_MODELS).map(([name, id]) => ({ id, name }));
  }

  async searchVoices(params: VoiceSearchParams): Promise<VoiceInfo[]> {
    return this.provider.searchVoices(params);
  }
}
