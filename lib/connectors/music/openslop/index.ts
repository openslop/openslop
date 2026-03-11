import { BaseMusicConnector } from "../connector";
import { OpenSlopMusic as OpenSlopMusicProvider } from "@/lib/providers/music/openslop";
import type {
  ConnectorConfig,
  ModelInfo,
  MusicGenerateParams,
} from "@/lib/connectors/types";
import { MUSIC_MODELS } from "./models";

export class OpenSlopMusic extends BaseMusicConnector {
  private provider: OpenSlopMusicProvider;

  constructor(config: ConnectorConfig) {
    super(config);
    this.provider = new OpenSlopMusicProvider(config.baseUrl);
  }

  async listModels(): Promise<ModelInfo[]> {
    return MUSIC_MODELS.map((id) => ({ id, name: id }));
  }

  protected async _generate(params: MusicGenerateParams): Promise<ArrayBuffer> {
    return this.provider.generate(params);
  }
}
