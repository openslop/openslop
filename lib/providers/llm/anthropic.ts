import { createAnthropic } from "@ai-sdk/anthropic";
import type { SharedV3ProviderOptions } from "@ai-sdk/provider";
import {
	generateText,
	streamText,
	type FilePart,
	type LanguageModelMiddleware,
	type LanguageModelUsage,
	type SystemModelMessage,
	type TextPart,
	wrapLanguageModel,
} from "ai";
import { z } from "zod";
import type { LLMGenerateResult, LLMStreamChunk } from "@/lib/connectors/types";
import { ANTHROPIC_LLM_MODELS } from "@/lib/connectors/llm/anthropic/models";
import { parseImageSource } from "@/lib/api/image-source";
import { logger } from "@/lib/api/logger";
import { errorMessage } from "@/lib/errors";
import {
	DEFAULT_THINKING_LEVEL,
	type ThinkingLevel,
} from "@/lib/connectors/llm/enums";
import { resizedImage } from "../resized-image";
import { validateByProbe } from "../validate";
import type { Priced } from "../base";
import type { AgentModel } from "./agent-model";
import type { LLMProvider, LLMRequest } from "./base";
import {
	keepNewestImages,
	replaceImageUrls,
	toolResultImages,
} from "./tool-result-images";

/** A refusal mid-stream arrives as the API's error object, not an Error. */
const StreamFailure = z.object({ message: z.string() });

function failed(error: unknown): unknown {
	if (error instanceof Error) return error;
	const failure = StreamFailure.safeParse(error);
	return new Error(
		failure.success
			? `Anthropic: ${failure.data.message}`
			: errorMessage(error),
		{ cause: error },
	);
}

const SUPPORTED_IMAGE_MEDIA_TYPES: readonly string[] = [
	"image/jpeg",
	"image/png",
	"image/gif",
	"image/webp",
];

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
	if (!SUPPORTED_IMAGE_MEDIA_TYPES.includes(source.mediaType)) {
		throw new Error(
			`Anthropic reference image media type "${source.mediaType}" is not supported; expected one of ${SUPPORTED_IMAGE_MEDIA_TYPES.join(", ")}`,
		);
	}
	return { type: "file", mediaType: source.mediaType, data: source.data };
}

const DEFAULT_MAX_TOKENS = 65536;

type ModelId =
	(typeof ANTHROPIC_LLM_MODELS)[keyof typeof ANTHROPIC_LLM_MODELS]["id"];

const USD_PER_MTOK: Record<ModelId, { input: number; output: number }> = {
	"claude-opus-5": { input: 5, output: 25 },
	"claude-sonnet-5": { input: 2, output: 10 },
	"claude-haiku-4-5-20251001": { input: 1, output: 5 },
};

const CACHE_READ_RATE = 0.1;
const CACHE_WRITE_RATE = 1.25;

function costOf(modelId: string, usage: LanguageModelUsage): number {
	const price = USD_PER_MTOK[modelId as ModelId];
	if (!price) throw new Error(`No price for Anthropic model "${modelId}"`);
	const { noCacheTokens, cacheReadTokens, cacheWriteTokens } =
		usage.inputTokenDetails;
	const billableInput =
		(noCacheTokens ?? 0) +
		(cacheReadTokens ?? 0) * CACHE_READ_RATE +
		(cacheWriteTokens ?? 0) * CACHE_WRITE_RATE;
	return (
		(billableInput * price.input + (usage.outputTokens ?? 0) * price.output) /
		1_000_000
	);
}

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

/** The API's cap on images per request. Models with a 200k-token context window take fewer. */
const MAX_IMAGES_PER_REQUEST = 600;
const MAX_IMAGES_PER_REQUEST_BY_MODEL: Partial<Record<string, number>> = {
	"claude-haiku-4-5-20251001": 100,
};
const IMAGES_DROPPED_PER_BATCH = 10;

// Past this many images in one request, the API refuses any over MAX_IMAGE_EDGE_PX.
const MAX_FULL_SIZE_IMAGES = 20;
const MAX_IMAGE_EDGE_PX = 3000;

const fitImageLimits = (modelId: string) => {
	const max =
		MAX_IMAGES_PER_REQUEST_BY_MODEL[modelId] ?? MAX_IMAGES_PER_REQUEST;
	return {
		transformParams: async ({ params }) => {
			const prompt = keepNewestImages(params.prompt, {
				max,
				batchSize: IMAGES_DROPPED_PER_BATCH,
			});
			if (toolResultImages(prompt).length <= MAX_FULL_SIZE_IMAGES)
				return { ...params, prompt };
			return {
				...params,
				prompt: await replaceImageUrls(prompt, (url) =>
					resizedImage("anthropic", url, MAX_IMAGE_EDGE_PX),
				),
			};
		},
	} satisfies LanguageModelMiddleware;
};

export class AnthropicLLM implements LLMProvider {
	constructor(private readonly apiKey: string) {}

	/** Listing one model is the cheapest call the API authenticates. */
	async validate() {
		return validateByProbe("https://api.anthropic.com/v1/models?limit=1", {
			headers: {
				"x-api-key": this.apiKey,
				"anthropic-version": "2023-06-01",
			},
		});
	}

	private model(modelId: string) {
		return createAnthropic({ apiKey: this.apiKey })(modelId);
	}

	/** Caching the last block too keeps a turn's transcript warm across its round trips. */
	agentModel(modelId: string): AgentModel {
		return {
			model: wrapLanguageModel({
				model: this.model(modelId),
				middleware: fitImageLimits(modelId),
			}),
			modelId,
			providerOptions: {
				anthropic: { ...thinking(DEFAULT_THINKING_LEVEL), ...CACHED },
			},
			cachedPrefix: CACHED_PREFIX,
			costOf: (usage) => costOf(modelId, usage),
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
			maxOutputTokens: params.maxTokens ?? DEFAULT_MAX_TOKENS,
			providerOptions: {
				anthropic: thinking(params.thinkingLevel || DEFAULT_THINKING_LEVEL),
			},
		};
	}

	async generate(params: LLMRequest): Promise<Priced<LLMGenerateResult>> {
		const result = await generateText(this.buildRequest(params));
		logger.info({ usage: result.usage }, "LLM usage");
		return {
			output: {
				text: result.text,
				model: result.finalStep.response.modelId,
				usage: {
					inputTokens: result.usage.inputTokens ?? 0,
					outputTokens: result.usage.outputTokens ?? 0,
				},
			},
			costUsd: costOf(params.model, result.usage),
		};
	}

	// fullStream, not textStream: textStream filters error parts out, which
	// would end a failed generation as a clean, empty success.
	async *stream(params: LLMRequest): AsyncGenerator<LLMStreamChunk, number> {
		const result = streamText(this.buildRequest(params));
		for await (const part of result.fullStream) {
			if (part.type === "text-delta") yield { text: part.text, done: false };
			if (part.type === "error") throw failed(part.error);
		}
		const usage = await result.usage;
		logger.info({ usage }, "LLM usage");
		yield { text: "", done: true };
		return costOf(params.model, usage);
	}
}
