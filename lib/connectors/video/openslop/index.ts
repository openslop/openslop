import { BaseVideoConnector } from "../connector";
import { OpenSlopVideoGateway } from "@/lib/gateway/openslop/video";
import type { ConnectorConfig, ModelInfo } from "@/lib/connectors/types";
import { modelsFromMap } from "@/lib/connectors/types";
import { VIDEO_MODELS } from "./models";

export class OpenSlopVideo extends BaseVideoConnector {
  protected gateway: OpenSlopVideoGateway;

  constructor(config: ConnectorConfig) {
    super(config);
    this.gateway = new OpenSlopVideoGateway(config.baseUrl);
  }

  async listModels(): Promise<ModelInfo[]> {
    return modelsFromMap(VIDEO_MODELS);
  }
}
