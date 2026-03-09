import { BaseConnector } from "../base";
import type {
  LLMConnector,
  LLMGenerateParams,
  LLMGenerateResult,
  LLMStreamChunk,
} from "../types";

export abstract class BaseLLMConnector
  extends BaseConnector<LLMGenerateParams, LLMGenerateResult>
  implements LLMConnector
{
  readonly type = "llm" as const;

  protected abstract _generate(
    params: LLMGenerateParams,
  ): Promise<LLMGenerateResult>;

  abstract stream(params: LLMGenerateParams): AsyncGenerator<LLMStreamChunk>;
}
