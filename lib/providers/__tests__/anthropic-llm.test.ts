import { describe, expect, it, vi, beforeEach } from "vitest";
import type {
	LanguageModelV3CallOptions,
	LanguageModelV3StreamPart,
} from "@ai-sdk/provider";
import { MockLanguageModelV3, simulateReadableStream } from "ai/test";

const { createAnthropic } = vi.hoisted(() => ({ createAnthropic: vi.fn() }));

vi.mock("@ai-sdk/anthropic", () => ({ createAnthropic }));

import { AnthropicLLM } from "../llm/anthropic";

const MODEL_ID = "claude-opus-5";

const model = new MockLanguageModelV3({
	modelId: MODEL_ID,
	// Matches what the real provider declares, so image URLs are passed through
	// rather than downloaded and inlined.
	supportedUrls: { "image/*": [/^https?:\/\/.*$/] },
});
createAnthropic.mockImplementation(() => () => model);

const USAGE = {
	inputTokens: { total: 10, noCache: 10, cacheRead: 0, cacheWrite: 0 },
	outputTokens: { total: 5, text: 5, reasoning: 0 },
};

const calls: LanguageModelV3CallOptions[] = [];

function respondWith(text: string) {
	model.doGenerate = async (options) => {
		calls.push(options);
		return {
			content: [{ type: "text" as const, text }],
			finishReason: { unified: "stop" as const, raw: "end_turn" },
			usage: USAGE,
			warnings: [],
		};
	};
}

function streamWith(deltas: string[], tail: LanguageModelV3StreamPart[] = []) {
	const chunks: LanguageModelV3StreamPart[] = [
		{ type: "stream-start", warnings: [] },
		{ type: "text-start", id: "t0" },
		...deltas.map((delta) => ({
			type: "text-delta" as const,
			id: "t0",
			delta,
		})),
		{ type: "text-end", id: "t0" },
		...tail,
		{
			type: "finish",
			finishReason: { unified: "stop", raw: "end_turn" },
			usage: USAGE,
		},
	];
	model.doStream = async (options) => {
		calls.push(options);
		return { stream: simulateReadableStream({ chunks, chunkDelayInMs: 0 }) };
	};
}

const lastCall = () => calls[0];
const userContent = () => lastCall().prompt.at(-1)?.content;

describe("AnthropicLLM", () => {
	beforeEach(() => {
		calls.length = 0;
	});

	describe("generate", () => {
		it("returns text and usage with defaults", async () => {
			respondWith("Hello world");

			const provider = new AnthropicLLM("test-key");
			const result = await provider.generate({ prompt: "hi", model: MODEL_ID });

			expect(result.output).toEqual({
				text: "Hello world",
				model: "claude-opus-5",
				usage: { inputTokens: 10, outputTokens: 5 },
			});
			expect(createAnthropic).toHaveBeenCalledWith({ apiKey: "test-key" });
			expect(lastCall().maxOutputTokens).toBe(65536);
			expect(userContent()).toEqual([{ type: "text", text: "hi" }]);
		});

		it("asks for summarized thinking, so thoughts are not empty", async () => {
			respondWith("ok");

			await new AnthropicLLM("test-key").generate({
				prompt: "hi",
				model: MODEL_ID,
			});

			expect(lastCall().providerOptions?.anthropic).toEqual({
				thinking: { type: "adaptive", display: "summarized" },
				effort: "high",
			});
		});

		it("passes custom params", async () => {
			respondWith("ok");

			await new AnthropicLLM("test-key").generate({
				prompt: "test",
				model: MODEL_ID,
				systemPrompt: "You are helpful",
				maxTokens: 100,
				thinkingLevel: "low",
			});

			expect(lastCall().maxOutputTokens).toBe(100);
			expect(lastCall().prompt[0]).toEqual({
				role: "system",
				content: "You are helpful",
				providerOptions: { anthropic: { cacheControl: { type: "ephemeral" } } },
			});
			expect(lastCall().providerOptions?.anthropic).toMatchObject({
				effort: "low",
			});
		});

		it("drops temperature, which Claude rejects", async () => {
			respondWith("ok");

			await new AnthropicLLM("test-key").generate({
				prompt: "hi",
				model: MODEL_ID,
				temperature: 0.5,
			});

			expect(lastCall().temperature).toBeUndefined();
		});

		it("includes reference images before the text", async () => {
			respondWith("ok");

			await new AnthropicLLM("test-key").generate({
				prompt: "describe",
				model: MODEL_ID,
				referenceImages: ["https://a/1.jpg", "https://a/2.jpg"],
			});

			expect(userContent()).toMatchObject([
				{
					type: "file",
					mediaType: "image/*",
					data: { url: new URL("https://a/1.jpg") },
				},
				{
					type: "file",
					mediaType: "image/*",
					data: { url: new URL("https://a/2.jpg") },
				},
				{ type: "text", text: "describe" },
			]);
		});

		it("converts base64 data URI reference images", async () => {
			respondWith("ok");

			await new AnthropicLLM("test-key").generate({
				prompt: "describe",
				model: MODEL_ID,
				referenceImages: ["data:image/png;base64,iVBORw0KGgo="],
			});

			expect(userContent()).toMatchObject([
				{ type: "file", mediaType: "image/png" },
				{ type: "text", text: "describe" },
			]);
		});

		it("rejects reference images that are neither URLs nor base64 data URIs", async () => {
			respondWith("ok");
			const provider = new AnthropicLLM("test-key");

			await expect(
				provider.generate({
					prompt: "describe",
					model: MODEL_ID,
					referenceImages: ["ftp://nope/img.png"],
				}),
			).rejects.toThrow(/must be an http\(s\) URL or a base64 data URI/);
			expect(calls).toHaveLength(0);
		});

		it("rejects data URIs with unsupported media types", async () => {
			respondWith("ok");
			const provider = new AnthropicLLM("test-key");

			await expect(
				provider.generate({
					prompt: "describe",
					model: MODEL_ID,
					referenceImages: ["data:image/svg+xml;base64,PHN2Zy8+"],
				}),
			).rejects.toThrow(/media type "image\/svg\+xml" is not supported/);
			expect(calls).toHaveLength(0);
		});
	});

	describe("cost", () => {
		it("prices a generation from the model's token rates", async () => {
			respondWith("Hello world");

			const { costUsd } = await new AnthropicLLM("test-key").generate({
				prompt: "hi",
				model: MODEL_ID,
			});

			expect(costUsd).toBeCloseTo((10 * 5 + 5 * 25) / 1_000_000);
		});

		it("prices cache reads at a tenth and cache writes at a quarter more", () => {
			const { costOf } = new AnthropicLLM("test-key").agentModel(MODEL_ID);

			const costUsd = costOf({
				inputTokens: 300,
				inputTokenDetails: {
					noCacheTokens: 100,
					cacheReadTokens: 100,
					cacheWriteTokens: 100,
				},
				outputTokens: 0,
				outputTokenDetails: { textTokens: 0, reasoningTokens: 0 },
				totalTokens: 300,
			});

			expect(costUsd).toBeCloseTo(((100 + 10 + 125) * 5) / 1_000_000);
		});

		it("fails loudly for a model it has no price for", async () => {
			respondWith("ok");

			await expect(
				new AnthropicLLM("test-key").generate({
					prompt: "hi",
					model: "custom",
				}),
			).rejects.toThrow('No price for Anthropic model "custom"');
		});

		it("returns what a stream cost once it ends", async () => {
			streamWith(["Hi"]);

			const stream = new AnthropicLLM("test-key").stream({
				prompt: "hi",
				model: MODEL_ID,
			});
			let next = await stream.next();
			while (!next.done) next = await stream.next();

			expect(next.value).toBeCloseTo((10 * 5 + 5 * 25) / 1_000_000);
		});
	});

	describe("stream", () => {
		it("yields text chunks and a final done event", async () => {
			streamWith(["Hello", " world"]);

			const provider = new AnthropicLLM("test-key");
			const chunks: { text: string; done: boolean }[] = [];
			for await (const chunk of provider.stream({
				prompt: "hi",
				model: MODEL_ID,
			})) {
				chunks.push(chunk);
			}

			expect(chunks).toEqual([
				{ text: "Hello", done: false },
				{ text: " world", done: false },
				{ text: "", done: true },
			]);
		});

		it("throws on a mid-stream error instead of ending as a clean success", async () => {
			streamWith(["Once upon"], [{ type: "error", error: "overloaded" }]);

			const provider = new AnthropicLLM("test-key");
			const read = async () => {
				const chunks: { text: string; done: boolean }[] = [];
				for await (const chunk of provider.stream({
					prompt: "hi",
					model: MODEL_ID,
				})) {
					chunks.push(chunk);
				}
				return chunks;
			};

			await expect(read()).rejects.toThrow("overloaded");
		});

		it("names the API's reason when the stream carries its error object", async () => {
			const refusal = { type: "overloaded_error", message: "Overloaded" };
			streamWith([], [{ type: "error", error: refusal }]);

			const provider = new AnthropicLLM("test-key");
			const read = async () => {
				for await (const chunk of provider.stream({
					prompt: "hi",
					model: MODEL_ID,
				})) {
					void chunk;
				}
			};

			await expect(read()).rejects.toThrow("Anthropic: Overloaded");
			await expect(read()).rejects.toHaveProperty("cause", refusal);
		});
	});
});

describe("agentModel", () => {
	it("caches the prompt's last block and hands Sloppy the mark for its prefix", () => {
		const agent = new AnthropicLLM("test-key").agentModel(MODEL_ID);

		expect(agent.providerOptions.anthropic).toMatchObject({
			cacheControl: { type: "ephemeral" },
			thinking: { type: "adaptive", display: "summarized" },
		});
		expect(agent.cachedPrefix).toEqual({
			anthropic: { cacheControl: { type: "ephemeral" } },
		});
	});
});
