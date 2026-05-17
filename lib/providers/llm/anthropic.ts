import Anthropic from "@anthropic-ai/sdk";
import type {
	LLMGenerateParams,
	LLMGenerateResult,
} from "@/lib/connectors/types";
import { BaseProvider } from "../base";

export class AnthropicLLM extends BaseProvider<
	LLMGenerateParams,
	LLMGenerateResult,
	LLMGenerateResult
> {
	protected readonly blobConfig = { type: "llm", provider: "anthropic" };
	private client: Anthropic;

	constructor(apiKey: string) {
		super();
		this.client = new Anthropic({ apiKey });
	}

	protected toFiles() {
		return [];
	}

	protected async store(result: LLMGenerateResult) {
		return result;
	}

	private buildRequest(params: LLMGenerateParams) {
		return {
			model: params.model || "claude-sonnet-4-5-20250929",
			max_tokens: params.maxTokens || 8192,
			temperature: params.temperature,
			system: params.systemPrompt || undefined,
			messages: [{ role: "user" as const, content: params.prompt }],
		};
	}

	protected async _generate(params: LLMGenerateParams) {
		const response = await this.client.messages.create(
			this.buildRequest(params),
		);

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
		const stream = this.client.messages.stream(this.buildRequest(params));

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
