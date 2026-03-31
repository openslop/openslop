import type { AssetBundle } from "@/lib/api/asset-bundle";
import { BaseMusicConnector } from "../connector";
import { OpenSlopMusic as OpenSlopMusicProvider } from "@/lib/providers/music/openslop";
import type {
  AssetResult,
  ConnectorConfig,
  ModelInfo,
} from "@/lib/connectors/types";
import { modelsFromMap } from "@/lib/connectors/types";
import { MUSIC_MODELS } from "./models";

export class OpenSlopMusic extends BaseMusicConnector {
  protected provider: OpenSlopMusicProvider;

  constructor(config: ConnectorConfig) {
    super(config);
    this.provider = new OpenSlopMusicProvider(config.baseUrl);
  }

  async listModels(): Promise<ModelInfo[]> {
    return modelsFromMap(MUSIC_MODELS);
  }

  async resolveBundle(bundle: AssetBundle): Promise<AssetResult> {
    return { url: bundle.resolve("audio") };
  }
}
