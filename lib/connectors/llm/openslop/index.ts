import { BaseLLMConnector } from "../connector";
import type {
  LLMGenerateParams,
  LLMGenerateResult,
  LLMStreamChunk,
  ModelInfo,
} from "@/lib/connectors/types";

export class OpenSlopLLM extends BaseLLMConnector {
  async listModels(): Promise<ModelInfo[]> {
    return [{ id: "openslop-default", name: "OpenSlop Default" }];
  }

  protected async _generate(
    params: LLMGenerateParams,
  ): Promise<LLMGenerateResult> {
    return {
      text: `[OpenSlop stub] Echo: ${params.prompt}`,
      model: params.model ?? "openslop-default",
    };
  }

  async *stream(params: LLMGenerateParams): AsyncGenerator<LLMStreamChunk> {
    const result = await this.generate(params);
    yield { text: result.text, done: true };
  }
}
