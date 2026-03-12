import type { BaseProvider } from "@/lib/providers/base";
import { BaseConnector } from "../base";
import type {
  LLMConnector,
  LLMGenerateParams,
  LLMGenerateResult,
  LLMStreamChunk,
} from "../types";

export abstract class BaseLLMConnector<
  TProvider extends BaseProvider<LLMGenerateParams, LLMGenerateResult> =
    BaseProvider<LLMGenerateParams, LLMGenerateResult>,
>
  extends BaseConnector<LLMGenerateParams, LLMGenerateResult, TProvider>
  implements LLMConnector
{
  readonly type = "llm" as const;

  abstract stream(params: LLMGenerateParams): AsyncGenerator<LLMStreamChunk>;
}
