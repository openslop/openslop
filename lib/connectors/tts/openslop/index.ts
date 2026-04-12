import type { AssetBundle } from "@/lib/api/asset-bundle";
import { BaseTTSConnector } from "../connector";
import { OpenSlopTTSGateway } from "@/lib/gateway/openslop/tts";
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
  protected gateway: OpenSlopTTSGateway;

  constructor(config: ConnectorConfig) {
    super(config);
    this.gateway = new OpenSlopTTSGateway(config.baseUrl);
  }

  async listModels(): Promise<ModelInfo[]> {
    return modelsFromMap(TTS_MODELS);
  }

  async searchVoices(params: VoiceSearchParams): Promise<VoiceInfo[]> {
    return this.gateway.searchVoices(params);
  }

  async resolveBundle(bundle: AssetBundle): Promise<TTSResult> {
    return {
      ...(await super.resolveBundle(bundle)),
      textTimestamps: await bundle.fetchJson<TextTimestamp[]>("timestamps"),
    };
  }
}
