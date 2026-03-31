import { BaseVideoConnector } from "../connector";
import { OpenSlopVideo as OpenSlopVideoProvider } from "@/lib/providers/video/openslop";
import type {
  ConnectorConfig,
  ModelInfo,
  VideoJob,
} from "@/lib/connectors/types";
import { modelsFromMap } from "@/lib/connectors/types";
import { VIDEO_MODELS } from "./models";

export class OpenSlopVideo extends BaseVideoConnector {
  protected provider: OpenSlopVideoProvider;

  constructor(config: ConnectorConfig) {
    super(config);
    this.provider = new OpenSlopVideoProvider(config.baseUrl);
  }

  async listModels(): Promise<ModelInfo[]> {
    return modelsFromMap(VIDEO_MODELS);
  }

  async poll(_jobId: string): Promise<VideoJob> {
    throw new Error("Video polling is no longer supported");
  }
}
