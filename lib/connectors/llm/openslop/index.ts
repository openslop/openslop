import { BaseLLMConnector } from "../connector";
import { OpenSlopLLM as OpenSlopLLMProvider } from "@/lib/providers/llm/openslop";
import type {
  ConnectorConfig,
  LLMGenerateParams,
  LLMGenerateResult,
  LLMStreamChunk,
  ModelInfo,
} from "@/lib/connectors/types";
import { LLM_MODELS } from "./models";

export class OpenSlopLLM extends BaseLLMConnector {
  private provider: OpenSlopLLMProvider;

  constructor(config: ConnectorConfig) {
    super(config);
    this.provider = new OpenSlopLLMProvider(config.baseUrl);
  }

  async listModels(): Promise<ModelInfo[]> {
    return LLM_MODELS.map((id) => ({ id, name: id }));
  }

  protected async _generate(
    params: LLMGenerateParams,
  ): Promise<LLMGenerateResult> {
    return this.provider.generate(params);
  }

  async *stream(params: LLMGenerateParams): AsyncGenerator<LLMStreamChunk> {
    yield* this.provider.stream(params);
  }
}
