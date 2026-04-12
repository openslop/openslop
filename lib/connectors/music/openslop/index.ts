import { BaseMusicConnector } from "../connector";
import { OpenSlopMusicGateway } from "@/lib/gateway/openslop/music";
import type { ConnectorConfig, ModelInfo } from "@/lib/connectors/types";
import { modelsFromMap } from "@/lib/connectors/types";
import { MUSIC_MODELS } from "./models";

export class OpenSlopMusic extends BaseMusicConnector {
  protected gateway: OpenSlopMusicGateway;

  constructor(config: ConnectorConfig) {
    super(config);
    this.gateway = new OpenSlopMusicGateway(config.baseUrl);
  }

  async listModels(): Promise<ModelInfo[]> {
    return modelsFromMap(MUSIC_MODELS);
  }
}
