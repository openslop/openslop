import { createAnthropic } from "@ai-sdk/anthropic";
import type { SharedV3ProviderOptions } from "@ai-sdk/provider";
import {
	generateText,
	streamText,
	type FilePart,
	type LanguageModel,
	type TextPart,
} from "ai";
import type {
	LLMGenerateParams,
	LLMGenerateResult,
} from "@/lib/connectors/types";
import { parseImageSource } from "@/lib/api/imageSource";
import { stringifyError } from "@/lib/errors";
import { DEFAULT_THINKING_LEVEL } from "@/lib/connectors/llm/enums";
import { BaseProvider } from "../base";
import type { AgentModel } from "./agentModel";

const SUPPORTED_IMAGE_MEDIA_TYPES = [
	"image/jpeg",
	"image/png",
	"image/gif",
	"image/webp",
] as const;

function toImagePart(image: string): FilePart {
	const source = parseImageSource(image);
	if (!source) {
		throw new Error(
			"Anthropic reference image must be an http(s) URL or a base64 data URI",
		);
	}
	if (source.kind === "url") {
		return { type: "file", mediaType: "image/*", data: new URL(source.url) };
	}
	if (
		!(SUPPORTED_IMAGE_MEDIA_TYPES as readonly string[]).includes(
			source.mediaType,
		)
	) {
		throw new Error(
			`Anthropic reference image media type "${source.mediaType}" is not supported; expected one of ${SUPPORTED_IMAGE_MEDIA_TYPES.join(", ")}`,
		);
	}
	return { type: "file", mediaType: source.mediaType, data: source.data };
}

const DEFAULT_MODEL = "claude-opus-5";
const DEFAULT_MAX_TOKENS = 65536;

export class AnthropicLLM extends BaseProvider<
	LLMGenerateParams,
	LLMGenerateResult,
	LLMGenerateResult
> {
	protected readonly blobConfig = { type: "llm", provider: "anthropic" };
	private apiKey: string;

	constructor(apiKey: string) {
		super();
		this.apiKey = apiKey;
	}

	protected toFiles() {
		return [];
	}

	protected async store(result: LLMGenerateResult) {
		return result;
	}

	private model(modelId: string): LanguageModel {
		return createAnthropic({ apiKey: this.apiKey })(modelId);
	}

	/**
	 * `display` defaults to "omitted", which streams empty thinking blocks.
	 * Summarized is what makes thoughts visible.
	 */
	private thinking(effort: string): SharedV3ProviderOptions {
		return {
			anthropic: {
				thinking: { type: "adaptive", display: "summarized" },
				effort,
			},
		};
	}

	agentModel(model = DEFAULT_MODEL): AgentModel {
		return {
			model: this.model(model),
			modelId: model,
			providerOptions: this.thinking(DEFAULT_THINKING_LEVEL),
		};
	}

	private buildRequest(params: LLMGenerateParams) {
		const images = params.referenceImages ?? [];
		const content: (FilePart | TextPart)[] = [
			...images.map(toImagePart),
			{ type: "text", text: params.prompt },
		];
		return {
			model: this.model(params.model || DEFAULT_MODEL),
			instructions: params.systemPrompt || undefined,
			messages: [{ role: "user" as const, content }],
			maxOutputTokens: params.maxTokens || DEFAULT_MAX_TOKENS,
			providerOptions: this.thinking(
				params.thinkingLevel || DEFAULT_THINKING_LEVEL,
			),
		};
	}

	protected async _generate(params: LLMGenerateParams) {
		const response = await generateText(this.buildRequest(params));
		return {
			text: response.text,
			model: response.response.modelId ?? params.model ?? DEFAULT_MODEL,
			usage: {
				inputTokens: response.usage.inputTokens ?? 0,
				outputTokens: response.usage.outputTokens ?? 0,
			},
		};
	}

	// fullStream, not textStream: textStream filters error parts out, which
	// would end a failed generation as a clean, empty success.
	async *stream(
		params: LLMGenerateParams,
	): AsyncGenerator<{ text: string; done: boolean }> {
		const result = streamText(this.buildRequest(params));
		for await (const part of result.fullStream) {
			if (part.type === "text-delta") yield { text: part.text, done: false };
			if (part.type === "error")
				throw part.error instanceof Error
					? part.error
					: new Error(stringifyError(part.error));
		}
		yield { text: "", done: true };
	}
}
