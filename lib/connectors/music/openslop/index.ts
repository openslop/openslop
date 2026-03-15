import { BaseMusicConnector } from "../connector";
import { OpenSlopMusic as OpenSlopMusicProvider } from "@/lib/providers/music/openslop";
import type { ConnectorConfig, ModelInfo } from "@/lib/connectors/types";
import { modelsFromMap } from "@/lib/connectors/types";
import { MUSIC_MODELS } from "./models";

export class OpenSlopMusic extends BaseMusicConnector<OpenSlopMusicProvider> {
  constructor(config: ConnectorConfig) {
    super(new OpenSlopMusicProvider(config.baseUrl), config);
  }

  async listModels(): Promise<ModelInfo[]> {
    return modelsFromMap(MUSIC_MODELS);
  }
}
