import { describe, expect, it, vi, beforeEach } from "vitest";

const mockCreate = vi.fn();
const mockStream = vi.fn();

vi.mock("@anthropic-ai/sdk", () => ({
	default: class {
		messages = { create: mockCreate, stream: mockStream };
	},
}));

import { AnthropicLLM } from "../llm/anthropic";

describe("AnthropicLLM", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("generate", () => {
		it("returns text and usage with defaults", async () => {
			mockCreate.mockResolvedValue({
				content: [{ type: "text", text: "Hello world" }],
				model: "claude-opus-4-8",
				usage: { input_tokens: 10, output_tokens: 5 },
			});

			const provider = new AnthropicLLM("test-key");
			const result = await provider.generate({ prompt: "hi" });

			expect(result).toEqual({
				text: "Hello world",
				model: "claude-opus-4-8",
				usage: { inputTokens: 10, outputTokens: 5 },
			});
			expect(mockCreate).toHaveBeenCalledWith({
				model: "claude-opus-4-8",
				max_tokens: 8192,
				temperature: undefined,
				system: undefined,
				messages: [{ role: "user", content: [{ type: "text", text: "hi" }] }],
			});
		});

		it("passes custom params", async () => {
			mockCreate.mockResolvedValue({
				content: [{ type: "text", text: "ok" }],
				model: "custom",
				usage: { input_tokens: 1, output_tokens: 1 },
			});

			const provider = new AnthropicLLM("test-key");
			await provider.generate({
				prompt: "test",
				model: "custom",
				systemPrompt: "You are helpful",
				maxTokens: 100,
				temperature: 0.5,
			});

			expect(mockCreate).toHaveBeenCalledWith({
				model: "custom",
				max_tokens: 100,
				temperature: 0.5,
				system: "You are helpful",
				messages: [{ role: "user", content: [{ type: "text", text: "test" }] }],
			});
		});

		it("includes reference images as url blocks before the text", async () => {
			mockCreate.mockResolvedValue({
				content: [{ type: "text", text: "ok" }],
				model: "claude-opus-4-8",
				usage: { input_tokens: 1, output_tokens: 1 },
			});

			const provider = new AnthropicLLM("test-key");
			await provider.generate({
				prompt: "describe",
				referenceImages: ["https://a/1.jpg", "https://a/2.jpg"],
			});

			expect(mockCreate.mock.calls[0][0].messages).toEqual([
				{
					role: "user",
					content: [
						{
							type: "image",
							source: { type: "url", url: "https://a/1.jpg" },
						},
						{
							type: "image",
							source: { type: "url", url: "https://a/2.jpg" },
						},
						{ type: "text", text: "describe" },
					],
				},
			]);
		});

		it("converts base64 data URI reference images into base64 source blocks", async () => {
			mockCreate.mockResolvedValue({
				content: [{ type: "text", text: "ok" }],
				model: "claude-opus-4-7",
				usage: { input_tokens: 1, output_tokens: 1 },
			});

			const provider = new AnthropicLLM("test-key");
			await provider.generate({
				prompt: "describe",
				referenceImages: [
					"data:image/png;base64,iVBORw0KGgo=",
					"https://a/2.jpg",
				],
			});

			expect(mockCreate.mock.calls[0][0].messages[0].content).toEqual([
				{
					type: "image",
					source: {
						type: "base64",
						media_type: "image/png",
						data: "iVBORw0KGgo=",
					},
				},
				{
					type: "image",
					source: { type: "url", url: "https://a/2.jpg" },
				},
				{ type: "text", text: "describe" },
			]);
		});

		it("rejects reference images that are neither URLs nor base64 data URIs", async () => {
			const provider = new AnthropicLLM("test-key");
			await expect(
				provider.generate({
					prompt: "describe",
					referenceImages: ["ftp://nope/img.png"],
				}),
			).rejects.toThrow(/must be an http\(s\) URL or a base64 data URI/);
			expect(mockCreate).not.toHaveBeenCalled();
		});

		it("rejects data URIs with unsupported media types", async () => {
			const provider = new AnthropicLLM("test-key");
			await expect(
				provider.generate({
					prompt: "describe",
					referenceImages: ["data:image/svg+xml;base64,PHN2Zy8+"],
				}),
			).rejects.toThrow(/media type "image\/svg\+xml" is not supported/);
			expect(mockCreate).not.toHaveBeenCalled();
		});

		it("concatenates multiple text blocks", async () => {
			mockCreate.mockResolvedValue({
				content: [
					{ type: "text", text: "Hello " },
					{ type: "text", text: "world" },
				],
				model: "test",
				usage: { input_tokens: 1, output_tokens: 2 },
			});

			const provider = new AnthropicLLM("test-key");
			const result = await provider.generate({ prompt: "hi" });
			expect(result.text).toBe("Hello world");
		});
	});

	describe("stream", () => {
		it("yields text chunks and a final done event", async () => {
			const events = [
				{
					type: "content_block_delta",
					delta: { type: "text_delta", text: "Hello" },
				},
				{
					type: "content_block_delta",
					delta: { type: "text_delta", text: " world" },
				},
				{ type: "message_stop" },
			];
			mockStream.mockReturnValue({
				[Symbol.asyncIterator]: async function* () {
					for (const e of events) yield e;
				},
			});

			const provider = new AnthropicLLM("test-key");
			const chunks: { text: string; done: boolean }[] = [];
			for await (const chunk of provider.stream({ prompt: "hi" })) {
				chunks.push(chunk);
			}

			expect(chunks).toEqual([
				{ text: "Hello", done: false },
				{ text: " world", done: false },
				{ text: "", done: true },
			]);
		});
	});
});
