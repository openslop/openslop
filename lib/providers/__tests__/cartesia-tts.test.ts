import { describe, expect, it, vi, beforeEach } from "vitest";

const mockClose = vi.fn();
const mockGenerate = vi.fn();
const mockConnect = vi.fn();
const mockVoicesList = vi.fn();

vi.mock("@cartesia/cartesia-js", () => ({
  default: class {
    tts = {
      websocket: vi.fn().mockResolvedValue({
        connect: mockConnect,
        generate: mockGenerate,
        close: mockClose,
      }),
    };
    voices = { list: mockVoicesList };
  },
}));

import { CartesiaTTS } from "../tts/cartesia";

describe("CartesiaTTS", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("generate", () => {
    it("collects audio chunks and text timestamps", async () => {
      const audioData = Buffer.from([1, 2, 3, 4, 5, 6, 7, 8]);
      const responses = [
        { type: "chunk", audio: audioData },
        {
          type: "timestamps",
          word_timestamps: {
            words: ["hello", "world"],
            start: [0.0, 0.5],
            end: [0.4, 0.9],
          },
        },
        { type: "done", done: true },
      ];
      mockGenerate.mockReturnValue({
        [Symbol.asyncIterator]: async function* () {
          for (const r of responses) yield r;
        },
      });

      const provider = new CartesiaTTS("test-key");
      const result = await provider.generate({
        prompt: "hello world",
        voiceId: "voice-1",
      });

      expect(result.data).toBe(audioData.toString("base64"));
      expect(result.textTimestamps).toEqual([
        { text: "hello", start: 0.0, end: 0.4 },
        { text: "world", start: 0.5, end: 0.9 },
      ]);
      expect(mockConnect).toHaveBeenCalled();
      expect(mockClose).toHaveBeenCalled();
    });

    it("passes custom model", async () => {
      mockGenerate.mockReturnValue({
        [Symbol.asyncIterator]: async function* () {
          yield { type: "done", done: true };
        },
      });

      const provider = new CartesiaTTS("test-key");
      await provider.generate({
        prompt: "test",
        voiceId: "v1",
        model: "sonic-4",
      });

      expect(mockGenerate).toHaveBeenCalledWith(
        expect.objectContaining({ model_id: "sonic-4" }),
      );
    });

    it("closes websocket on error", async () => {
      mockGenerate.mockReturnValue({
        [Symbol.asyncIterator]: async function* () {
          throw new Error("ws error");
        },
      });

      const provider = new CartesiaTTS("test-key");
      await expect(
        provider.generate({ prompt: "test", voiceId: "v1" }),
      ).rejects.toThrow("ws error");
      expect(mockClose).toHaveBeenCalled();
    });
  });

  describe("search", () => {
    it("returns mapped voice info", async () => {
      mockVoicesList.mockResolvedValue({
        data: [
          {
            id: "v1",
            name: "English Voice",
            language: "en",
            gender: "feminine",
            description: "A warm voice",
            preview_file_url: "https://preview.mp3",
          },
          {
            id: "v2",
            name: "Neutral Voice",
            language: "en",
            gender: null,
            description: "Neutral",
            preview_file_url: null,
          },
        ],
      });

      const provider = new CartesiaTTS("test-key");
      const voices = await provider.search({
        query: "english",
        language: "en",
      });

      expect(voices).toEqual([
        {
          id: "v1",
          name: "English Voice",
          language: "en",
          gender: "feminine",
          description: "A warm voice",
          previewUrl: "https://preview.mp3",
        },
        {
          id: "v2",
          name: "Neutral Voice",
          language: "en",
          gender: undefined,
          description: "Neutral",
          previewUrl: undefined,
        },
      ]);
      expect(mockVoicesList).toHaveBeenCalledWith({
        q: "english",
        gender: undefined,
        limit: 20,
      });
    });

    it("passes gender filter", async () => {
      mockVoicesList.mockResolvedValue({ data: [] });

      const provider = new CartesiaTTS("test-key");
      await provider.search({ gender: "masculine", limit: 5 });

      expect(mockVoicesList).toHaveBeenCalledWith({
        q: undefined,
        gender: "masculine",
        limit: 5,
      });
    });

    it("filters voices by language", async () => {
      mockVoicesList.mockResolvedValue({
        data: [
          {
            id: "v1",
            name: "English Voice",
            language: "en",
            gender: "feminine",
            description: "English",
            preview_file_url: null,
          },
          {
            id: "v2",
            name: "French Voice",
            language: "fr",
            gender: "masculine",
            description: "French",
            preview_file_url: null,
          },
          {
            id: "v3",
            name: "Another English",
            language: "en",
            gender: "masculine",
            description: "Also English",
            preview_file_url: null,
          },
        ],
      });

      const provider = new CartesiaTTS("test-key");
      const voices = await provider.search({ language: "en" });

      expect(voices).toHaveLength(2);
      expect(voices.map((v) => v.id)).toEqual(["v1", "v3"]);
    });
  });
});
