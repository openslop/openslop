import Anthropic from "@anthropic-ai/sdk";
import type {
	LLMGenerateParams,
	LLMGenerateResult,
} from "@/lib/connectors/types";
import { BaseProvider } from "../base";

const SUPPORTED_IMAGE_MEDIA_TYPES = [
	"image/jpeg",
	"image/png",
	"image/gif",
	"image/webp",
] as const;

type SupportedImageMediaType = (typeof SUPPORTED_IMAGE_MEDIA_TYPES)[number];

function isSupportedMediaType(value: string): value is SupportedImageMediaType {
	return (SUPPORTED_IMAGE_MEDIA_TYPES as readonly string[]).includes(value);
}

function toImageBlock(image: string): Anthropic.ImageBlockParam {
	if (/^https?:\/\//i.test(image)) {
		return { type: "image", source: { type: "url", url: image } };
	}
	const match = /^data:([a-z]+\/[a-z0-9+.-]+);base64,(.+)$/i.exec(image);
	if (!match) {
		throw new Error(
			"Anthropic reference image must be an http(s) URL or a base64 data URI",
		);
	}
	const mediaType = match[1].toLowerCase();
	if (!isSupportedMediaType(mediaType)) {
		throw new Error(
			`Anthropic reference image media type "${mediaType}" is not supported; expected one of ${SUPPORTED_IMAGE_MEDIA_TYPES.join(", ")}`,
		);
	}
	return {
		type: "image",
		source: { type: "base64", media_type: mediaType, data: match[2] },
	};
}

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
		const images = params.referenceImages ?? [];
		const content: Anthropic.ContentBlockParam[] = [
			...images.map(toImageBlock),
			{ type: "text" as const, text: params.prompt },
		];
		return {
			model: params.model || "claude-opus-4-7",
			max_tokens: params.maxTokens || 8192,
			temperature: params.temperature,
			system: params.systemPrompt || undefined,
			messages: [{ role: "user" as const, content }],
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
