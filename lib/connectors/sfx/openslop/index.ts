import { BaseSFXConnector } from "../connector";
import { OpenSlopSFX as OpenSlopSFXProvider } from "@/lib/providers/sfx/openslop";
import type { ConnectorConfig, ModelInfo } from "@/lib/connectors/types";
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
}
