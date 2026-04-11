import { BaseImageConnector } from "../connector";
import { OpenSlopImageGateway } from "@/lib/gateway/openslop/image";
import type { ConnectorConfig, ModelInfo } from "@/lib/connectors/types";
import { modelsFromMap } from "@/lib/connectors/types";
import { IMAGE_MODELS } from "./models";

export class OpenSlopImage extends BaseImageConnector {
  protected gateway: OpenSlopImageGateway;

  constructor(config: ConnectorConfig) {
    super(config);
    this.gateway = new OpenSlopImageGateway(config.baseUrl);
  }

  async listModels(): Promise<ModelInfo[]> {
    return modelsFromMap(IMAGE_MODELS);
  }
}
