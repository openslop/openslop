import { createAnthropic } from "@ai-sdk/anthropic";
import type { SharedV3ProviderOptions } from "@ai-sdk/provider";
import {
	generateText,
	streamText,
	type FilePart,
	type LanguageModel,
	type SystemModelMessage,
	type TextPart,
} from "ai";
import type { LLMGenerateResult, LLMStreamChunk } from "@/lib/connectors/types";
import { parseImageSource } from "@/lib/api/imageSource";
import { logger } from "@/lib/api/logger";
import { stringifyError } from "@/lib/errors";
import {
	DEFAULT_THINKING_LEVEL,
	type ThinkingLevel,
} from "@/lib/connectors/llm/enums";
import { validateByProbe } from "../validate";
import type { AgentModel } from "./agentModel";
import type { LLMProvider, LLMRequest } from "./base";

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

const DEFAULT_MAX_TOKENS = 65536;

/** A prefix the API keeps between requests and serves at a tenth of the price. */
const CACHED = { cacheControl: { type: "ephemeral" } };
const CACHED_PREFIX: SharedV3ProviderOptions = { anthropic: CACHED };

/**
 * `display` defaults to "omitted", which streams empty thinking blocks.
 * Summarized is what makes thoughts visible.
 */
const thinking = (effort: ThinkingLevel) => ({
	thinking: { type: "adaptive", display: "summarized" },
	effort,
});

export class AnthropicLLM implements LLMProvider {
	private apiKey: string;

	constructor(apiKey: string) {
		this.apiKey = apiKey;
	}

	/** Listing one model is the cheapest call the API authenticates. */
	async validate() {
		return validateByProbe("https://api.anthropic.com/v1/models?limit=1", {
			headers: {
				"x-api-key": this.apiKey,
				"anthropic-version": "2023-06-01",
			},
		});
	}

	private model(modelId: string): LanguageModel {
		return createAnthropic({ apiKey: this.apiKey })(modelId);
	}

	/** Caching the last block too keeps a turn's transcript warm across its round trips. */
	agentModel(model: string): AgentModel {
		return {
			model: this.model(model),
			modelId: model,
			providerOptions: {
				anthropic: { ...thinking(DEFAULT_THINKING_LEVEL), ...CACHED },
			},
			cachedPrefix: CACHED_PREFIX,
		};
	}

	private buildRequest(params: LLMRequest) {
		const images = params.referenceImages ?? [];
		const content: (FilePart | TextPart)[] = [
			...images.map(toImagePart),
			{ type: "text", text: params.prompt },
		];
		const instructions: SystemModelMessage[] = params.systemPrompt
			? [
					{
						role: "system",
						content: params.systemPrompt,
						providerOptions: CACHED_PREFIX,
					},
				]
			: [];
		return {
			model: this.model(params.model),
			instructions,
			messages: [{ role: "user" as const, content }],
			maxOutputTokens: params.maxTokens || DEFAULT_MAX_TOKENS,
			providerOptions: {
				anthropic: thinking(params.thinkingLevel || DEFAULT_THINKING_LEVEL),
			},
		};
	}

	async generate(params: LLMRequest): Promise<LLMGenerateResult> {
		const response = await generateText(this.buildRequest(params));
		logger.info({ usage: response.usage }, "LLM usage");
		return {
			text: response.text,
			model: response.response.modelId,
			usage: {
				inputTokens: response.usage.inputTokens ?? 0,
				outputTokens: response.usage.outputTokens ?? 0,
			},
		};
	}

	// fullStream, not textStream: textStream filters error parts out, which
	// would end a failed generation as a clean, empty success.
	async *stream(params: LLMRequest): AsyncGenerator<LLMStreamChunk> {
		const result = streamText(this.buildRequest(params));
		for await (const part of result.fullStream) {
			if (part.type === "text-delta") yield { text: part.text, done: false };
			if (part.type === "error")
				throw part.error instanceof Error
					? part.error
					: new Error(stringifyError(part.error));
		}
		logger.info({ usage: await result.usage }, "LLM usage");
		yield { text: "", done: true };
	}
}
