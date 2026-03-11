import Anthropic from "@anthropic-ai/sdk";
import type { LLMGenerateParams } from "@/lib/connectors/types";

export class AnthropicLLM {
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async generate(params: LLMGenerateParams) {
    const response = await this.client.messages.create({
      model: params.model || "claude-sonnet-4-5-20250929",
      max_tokens: params.maxTokens || 4096,
      temperature: params.temperature,
      system: params.systemPrompt || undefined,
      messages: [{ role: "user", content: params.prompt }],
    });

    const text = response.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");

    return {
      text,
      model: response.model,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    };
  }

  async *stream(
    params: LLMGenerateParams,
  ): AsyncGenerator<{ text: string; done: boolean }> {
    const stream = this.client.messages.stream({
      model: params.model || "claude-sonnet-4-5-20250929",
      max_tokens: params.maxTokens || 4096,
      temperature: params.temperature,
      system: params.systemPrompt || undefined,
      messages: [{ role: "user", content: params.prompt }],
    });

    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        yield { text: event.delta.text, done: false };
      }
    }
    yield { text: "", done: true };
  }
}
