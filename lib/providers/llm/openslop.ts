import type {
  LLMGenerateParams,
  LLMGenerateResult,
  LLMStreamChunk,
} from "@/lib/connectors/types";
import { BaseOpenSlopProvider } from "../openslop-base";

export class OpenSlopLLM extends BaseOpenSlopProvider<
  LLMGenerateParams,
  LLMGenerateResult
> {
  async generate(params: LLMGenerateParams): Promise<LLMGenerateResult> {
    return this.client.post("/api/v1/llm", params);
  }

  async *stream(params: LLMGenerateParams): AsyncGenerator<LLMStreamChunk> {
    const res = await this.client.postStream("/api/v1/llm", {
      ...params,
      stream: true,
    });
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      buffer = lines.pop()!;

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          yield JSON.parse(line.slice(6)) as LLMStreamChunk;
        }
      }
    }
  }
}
