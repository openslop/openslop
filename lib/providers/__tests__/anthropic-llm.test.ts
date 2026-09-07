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
		vi.clearAllMocks();
		calls.length = 0;
	});

	describe("generate", () => {
		it("returns text and usage with defaults", async () => {
			respondWith("Hello world");

			const provider = new AnthropicLLM("test-key");
			const result = await provider.generate({ prompt: "hi", model: MODEL_ID });

			expect(result).toEqual({
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
				model: "custom",
				systemPrompt: "You are helpful",
				maxTokens: 100,
				thinkingLevel: "low",
			});

			expect(lastCall().maxOutputTokens).toBe(100);
			expect(lastCall().prompt[0]).toEqual({
				role: "system",
				content: "You are helpful",
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
	});
});
