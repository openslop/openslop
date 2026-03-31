import { BaseImageConnector } from "../connector";
import { OpenSlopImage as OpenSlopImageProvider } from "@/lib/providers/image/openslop";
import type { ConnectorConfig, ModelInfo } from "@/lib/connectors/types";
import { modelsFromMap } from "@/lib/connectors/types";
import { IMAGE_MODELS } from "./models";

export class OpenSlopImage extends BaseImageConnector {
  protected provider: OpenSlopImageProvider;

  constructor(config: ConnectorConfig) {
    super(config);
    this.provider = new OpenSlopImageProvider(config.baseUrl);
  }

  async listModels(): Promise<ModelInfo[]> {
    return modelsFromMap(IMAGE_MODELS);
  }
}
