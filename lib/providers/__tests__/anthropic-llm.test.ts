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
        model: "claude-sonnet-4-5-20250929",
        usage: { input_tokens: 10, output_tokens: 5 },
      });

      const provider = new AnthropicLLM("test-key");
      const result = await provider.generate({ prompt: "hi" });

      expect(result).toEqual({
        text: "Hello world",
        model: "claude-sonnet-4-5-20250929",
        usage: { inputTokens: 10, outputTokens: 5 },
      });
      expect(mockCreate).toHaveBeenCalledWith({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 4096,
        temperature: undefined,
        system: undefined,
        messages: [{ role: "user", content: "hi" }],
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
        messages: [{ role: "user", content: "test" }],
      });
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
