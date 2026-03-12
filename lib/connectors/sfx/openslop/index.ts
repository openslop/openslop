import { BaseSFXConnector } from "../connector";
import { OpenSlopSFX as OpenSlopSFXProvider } from "@/lib/providers/sfx/openslop";
import type { ConnectorConfig, ModelInfo } from "@/lib/connectors/types";
import { SFX_MODELS } from "./models";

export class OpenSlopSFX extends BaseSFXConnector<OpenSlopSFXProvider> {
  constructor(config: ConnectorConfig) {
    super(new OpenSlopSFXProvider(config.baseUrl), config);
  }

  async listModels(): Promise<ModelInfo[]> {
    return SFX_MODELS.map((id) => ({ id, name: id }));
  }
}
