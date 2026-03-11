import { BaseImageConnector } from "../connector";
import { OpenSlopImage as OpenSlopImageProvider } from "@/lib/providers/image/openslop";
import type {
  ConnectorConfig,
  ImageGenerateParams,
  ImageResult,
  ModelInfo,
} from "@/lib/connectors/types";
import { IMAGE_MODELS } from "./models";

export class OpenSlopImage extends BaseImageConnector {
  private provider: OpenSlopImageProvider;

  constructor(config: ConnectorConfig) {
    super(config);
    this.provider = new OpenSlopImageProvider(config.baseUrl);
  }

  async listModels(): Promise<ModelInfo[]> {
    return IMAGE_MODELS.map((id) => ({ id, name: id }));
  }

  protected async _generate(params: ImageGenerateParams): Promise<ImageResult> {
    return this.provider.generate(params);
  }
}
