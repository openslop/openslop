import type { AssetBundle } from "@/lib/api/asset-bundle";
import { BaseTTSConnector } from "../connector";
import { OpenSlopTTS as OpenSlopTTSProvider } from "@/lib/providers/tts/openslop";
import type {
  ConnectorConfig,
  ModelInfo,
  TextTimestamp,
  TTSResult,
  VoiceInfo,
  VoiceSearchParams,
} from "@/lib/connectors/types";
import { modelsFromMap } from "@/lib/connectors/types";
import { TTS_MODELS } from "./models";

export class OpenSlopTTS extends BaseTTSConnector {
  protected provider: OpenSlopTTSProvider;

  constructor(config: ConnectorConfig) {
    super(config);
    this.provider = new OpenSlopTTSProvider(config.baseUrl);
  }

  async listModels(): Promise<ModelInfo[]> {
    return modelsFromMap(TTS_MODELS);
  }

  async searchVoices(params: VoiceSearchParams): Promise<VoiceInfo[]> {
    return this.provider.searchVoices(params);
  }

  async resolveBundle(bundle: AssetBundle): Promise<TTSResult> {
    return {
      url: bundle.resolve(this.resultKind),
      textTimestamps: await bundle.fetchJson<TextTimestamp[]>("timestamps"),
    };
  }
}
