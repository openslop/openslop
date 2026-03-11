import { BaseSFXConnector } from "../connector";
import { OpenSlopSFX as OpenSlopSFXProvider } from "@/lib/providers/sfx/openslop";
import type {
  ConnectorConfig,
  ModelInfo,
  SFXGenerateParams,
} from "@/lib/connectors/types";
import { SFX_MODELS } from "./models";

export class OpenSlopSFX extends BaseSFXConnector {
  private provider: OpenSlopSFXProvider;

  constructor(config: ConnectorConfig) {
    super(config);
    this.provider = new OpenSlopSFXProvider(config.baseUrl);
  }

  async listModels(): Promise<ModelInfo[]> {
    return SFX_MODELS.map((id) => ({ id, name: id }));
  }

  protected async _generate(params: SFXGenerateParams): Promise<ArrayBuffer> {
    return this.provider.generate(params);
  }
}
