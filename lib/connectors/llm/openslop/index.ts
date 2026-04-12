import { BaseLLMConnector } from "../connector";
import { OpenSlopLLMGateway } from "@/lib/gateway/openslop/llm";
import type {
  ConnectorConfig,
  LLMGenerateParams,
  LLMStreamChunk,
  ModelInfo,
} from "@/lib/connectors/types";
import { modelsFromMap } from "@/lib/connectors/types";
import { LLM_MODELS } from "./models";

export class OpenSlopLLM extends BaseLLMConnector<OpenSlopLLMGateway> {
  constructor(config: ConnectorConfig) {
    super(new OpenSlopLLMGateway(config.baseUrl), config);
  }

  async listModels(): Promise<ModelInfo[]> {
    return modelsFromMap(LLM_MODELS);
  }

  protected async *_stream(
    params: LLMGenerateParams,
  ): AsyncGenerator<LLMStreamChunk> {
    yield* this.gateway.stream(params);
  }
}
