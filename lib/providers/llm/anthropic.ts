import Anthropic from "@anthropic-ai/sdk";
import type {
	LLMGenerateParams,
	LLMGenerateResult,
} from "@/lib/connectors/types";
import { parseImageSource } from "@/lib/api/imageSource";
import { BaseProvider } from "../base";

const SUPPORTED_IMAGE_MEDIA_TYPES = [
	"image/jpeg",
	"image/png",
	"image/gif",
	"image/webp",
] as const;

type SupportedImageMediaType = (typeof SUPPORTED_IMAGE_MEDIA_TYPES)[number];

const NON_STREAMING_TIMEOUT_MS = 10 * 60 * 1000;

function isSupportedMediaType(value: string): value is SupportedImageMediaType {
	return (SUPPORTED_IMAGE_MEDIA_TYPES as readonly string[]).includes(value);
}

function toImageBlock(image: string): Anthropic.ImageBlockParam {
	const source = parseImageSource(image);
	if (!source) {
		throw new Error(
			"Anthropic reference image must be an http(s) URL or a base64 data URI",
		);
	}
	if (source.kind === "url") {
		return { type: "image", source: { type: "url", url: source.url } };
	}
	if (!isSupportedMediaType(source.mediaType)) {
		throw new Error(
			`Anthropic reference image media type "${source.mediaType}" is not supported; expected one of ${SUPPORTED_IMAGE_MEDIA_TYPES.join(", ")}`,
		);
	}
	return {
		type: "image",
		source: {
			type: "base64",
			media_type: source.mediaType,
			data: source.data,
		},
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
		// Without an explicit timeout the SDK derives one from `max_tokens` for
		// non-streaming calls and throws outright above ~21k tokens, which our
		// default exceeds. Opt in to its 10-minute ceiling instead.
		this.client = new Anthropic({ apiKey, timeout: NON_STREAMING_TIMEOUT_MS });
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
			model: params.model || "claude-opus-4-8",
			max_tokens: params.maxTokens || 65536,
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
