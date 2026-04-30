import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/api/asset-bundle");

const mockClose = vi.fn();
const mockGenerate = vi.fn();
const mockConnect = vi.fn();
const mockVoicesList = vi.fn();
const mockEmbed = vi.fn();
const mockEmbedMany = vi.fn();

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

vi.mock("ai", () => ({
	embed: (...args: unknown[]) => mockEmbed(...args),
	embedMany: (...args: unknown[]) => mockEmbedMany(...args),
	cosineSimilarity: (a: number[], b: number[]) =>
		a.reduce((s, x, i) => s + x * b[i], 0),
}));

vi.mock("@ai-sdk/openai", () => ({
	openai: { embedding: () => ({}) },
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

			expect(result.result.audio).toBe("url");
			expect(result.result.timestamps).toBe("url");
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
				age: "adult",
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
				q: "adult",
				gender: undefined,
				limit: 100,
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

		it("re-ranks voices by description similarity when semantic descriptors provided", async () => {
			mockVoicesList.mockResolvedValue({
				data: [
					{
						id: "v1",
						name: "Cold",
						language: "en",
						gender: "feminine",
						description: "cold robotic voice",
						preview_file_url: null,
					},
					{
						id: "v2",
						name: "Warm",
						language: "en",
						gender: "feminine",
						description: "warm british narrator",
						preview_file_url: null,
					},
				],
			});
			mockEmbed.mockResolvedValue({ embedding: [1, 0] });
			mockEmbedMany.mockResolvedValue({
				embeddings: [
					[0, 1],
					[1, 0],
				],
			});

			const provider = new CartesiaTTS("test-key");
			const voices = await provider.search({ description: "warm british" });

			expect(voices.map((v) => v.id)).toEqual(["v2", "v1"]);
			expect(mockEmbed).toHaveBeenCalledWith(
				expect.objectContaining({ value: "warm british" }),
			);
			expect(mockEmbedMany).toHaveBeenCalledWith(
				expect.objectContaining({
					values: ["cold robotic voice", "warm british narrator"],
				}),
			);
		});

		it("skips embedding when no semantic descriptors provided", async () => {
			mockVoicesList.mockResolvedValue({
				data: [
					{
						id: "v1",
						name: "A",
						language: "en",
						gender: "masculine",
						description: "first",
						preview_file_url: null,
					},
					{
						id: "v2",
						name: "B",
						language: "en",
						gender: "masculine",
						description: "second",
						preview_file_url: null,
					},
				],
			});

			const provider = new CartesiaTTS("test-key");
			const voices = await provider.search({ gender: "masculine" });

			expect(voices.map((v) => v.id)).toEqual(["v1", "v2"]);
			expect(mockEmbed).not.toHaveBeenCalled();
			expect(mockEmbedMany).not.toHaveBeenCalled();
		});

		it("falls back to unranked results when embedding throws", async () => {
			mockVoicesList.mockResolvedValue({
				data: [
					{
						id: "v1",
						name: "A",
						language: "en",
						gender: "feminine",
						description: "first",
						preview_file_url: null,
					},
					{
						id: "v2",
						name: "B",
						language: "en",
						gender: "feminine",
						description: "second",
						preview_file_url: null,
					},
				],
			});
			mockEmbed.mockRejectedValue(new Error("missing api key"));
			mockEmbedMany.mockResolvedValue({
				embeddings: [
					[1, 0],
					[0, 1],
				],
			});

			const provider = new CartesiaTTS("test-key");
			const voices = await provider.search({ description: "anything" });

			expect(voices.map((v) => v.id)).toEqual(["v1", "v2"]);
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
