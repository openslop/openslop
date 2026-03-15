import { BaseVideoConnector } from "../connector";
import { OpenSlopVideo as OpenSlopVideoProvider } from "@/lib/providers/video/openslop";
import type {
  ConnectorConfig,
  ModelInfo,
  VideoJob,
} from "@/lib/connectors/types";
import { modelsFromMap } from "@/lib/connectors/types";
import { VIDEO_MODELS } from "./models";

export class OpenSlopVideo extends BaseVideoConnector<OpenSlopVideoProvider> {
  constructor(config: ConnectorConfig) {
    super(new OpenSlopVideoProvider(config.baseUrl), config);
  }

  async listModels(): Promise<ModelInfo[]> {
    return modelsFromMap(VIDEO_MODELS);
  }

  async poll(jobId: string): Promise<VideoJob> {
    return this.provider.poll(jobId);
  }
}
