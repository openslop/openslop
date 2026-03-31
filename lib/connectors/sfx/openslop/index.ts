import type { AssetBundle } from "@/lib/api/asset-bundle";
import { BaseSFXConnector } from "../connector";
import { OpenSlopSFX as OpenSlopSFXProvider } from "@/lib/providers/sfx/openslop";
import type {
  AssetResult,
  ConnectorConfig,
  ModelInfo,
} from "@/lib/connectors/types";
import { modelsFromMap } from "@/lib/connectors/types";
import { SFX_MODELS } from "./models";

export class OpenSlopSFX extends BaseSFXConnector {
  protected provider: OpenSlopSFXProvider;

  constructor(config: ConnectorConfig) {
    super(config);
    this.provider = new OpenSlopSFXProvider(config.baseUrl);
  }

  async listModels(): Promise<ModelInfo[]> {
    return modelsFromMap(SFX_MODELS);
  }

  async resolveBundle(bundle: AssetBundle): Promise<AssetResult> {
    return { url: bundle.resolve("audio") };
  }
}
