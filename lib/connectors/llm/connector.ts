import type { BaseProvider } from "@/lib/providers/base";
import { BaseConnector } from "../base";
import { runOnError } from "../plugins";
import type {
  LLMConnector,
  LLMGenerateParams,
  LLMGenerateResult,
  LLMStreamChunk,
  PluginContext,
} from "../types";

export abstract class BaseLLMConnector<
  TProvider extends BaseProvider<LLMGenerateParams, LLMGenerateResult> =
    BaseProvider<LLMGenerateParams, LLMGenerateResult>,
>
  extends BaseConnector<LLMGenerateParams, LLMGenerateResult, TProvider>
  implements LLMConnector
{
  readonly type = "llm" as const;

  async *stream(params: LLMGenerateParams): AsyncGenerator<LLMStreamChunk> {
    const ctx: PluginContext<LLMGenerateParams, LLMGenerateResult> = {
      provider: this.provider,
    };
    try {
      const { params: prepared } = await this.prepareParams(params);
      yield* this._stream(prepared);
    } catch (error) {
      await runOnError(this.plugins, error as Error, ctx);
      throw error;
    }
  }

  protected abstract _stream(
    params: LLMGenerateParams,
  ): AsyncGenerator<LLMStreamChunk>;
}
