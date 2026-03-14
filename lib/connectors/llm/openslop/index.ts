import { BaseLLMConnector } from "../connector";
import { OpenSlopLLM as OpenSlopLLMProvider } from "@/lib/providers/llm/openslop";
import type {
  ConnectorConfig,
  LLMGenerateParams,
  LLMStreamChunk,
  ModelInfo,
} from "@/lib/connectors/types";
import { LLM_MODELS } from "./models";

export class OpenSlopLLM extends BaseLLMConnector<OpenSlopLLMProvider> {
  constructor(config: ConnectorConfig) {
    super(new OpenSlopLLMProvider(config.baseUrl), config);
  }

  async listModels(): Promise<ModelInfo[]> {
    return Object.entries(LLM_MODELS).map(([name, id]) => ({ id, name }));
  }

  protected async *_stream(
    params: LLMGenerateParams,
  ): AsyncGenerator<LLMStreamChunk> {
    yield* this.provider.stream(params);
  }
}
