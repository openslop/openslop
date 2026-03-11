import { BaseVideoConnector } from "../connector";
import { OpenSlopVideo as OpenSlopVideoProvider } from "@/lib/providers/video/openslop";
import type {
  ConnectorConfig,
  ModelInfo,
  VideoGenerateParams,
  VideoJob,
} from "@/lib/connectors/types";
import { VIDEO_MODELS } from "./models";

export class OpenSlopVideo extends BaseVideoConnector {
  private provider: OpenSlopVideoProvider;

  constructor(config: ConnectorConfig) {
    super(config);
    this.provider = new OpenSlopVideoProvider(config.baseUrl);
  }

  async listModels(): Promise<ModelInfo[]> {
    return VIDEO_MODELS.map((id) => ({ id, name: id }));
  }

  protected async _generate(params: VideoGenerateParams): Promise<VideoJob> {
    return this.provider.submit(params);
  }

  async poll(jobId: string): Promise<VideoJob> {
    return this.provider.poll(jobId);
  }
}
