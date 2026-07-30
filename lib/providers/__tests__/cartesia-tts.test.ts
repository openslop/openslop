import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/api/asset-bundle");

const { mockCacheStore } = vi.hoisted(() => ({
	mockCacheStore: new Map<string, unknown>(),
}));

vi.mock("next/cache", () => ({
	unstable_cache:
		(fn: (...a: unknown[]) => unknown, keyParts: unknown[] = []) =>
		async (...args: unknown[]) => {
			const key = JSON.stringify([keyParts, args]);
			if (!mockCacheStore.has(key)) mockCacheStore.set(key, await fn(...args));
			return mockCacheStore.get(key);
		},
}));

const mockClose = vi.fn();
const mockGenerate = vi.fn();
const mockConnect = vi.fn();
const mockGet = vi.fn();
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
		get = mockGet;
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

import type Cartesia from "@cartesia/cartesia-js";
import { TTSEmotion } from "@/lib/connectors/tts/enums";
import { CartesiaTTS, collectVoices, pcmDurationSec } from "../tts/cartesia";

/** pcm_f32le @ 44.1kHz mono: 4 bytes per sample. */
const PCM_BYTES_PER_SEC = 44100 * 4;
const pcmChunk = (seconds: number) =>
	Buffer.alloc(seconds * PCM_BYTES_PER_SEC, 1);

const streamOf = (responses: object[]) => ({
	[Symbol.asyncIterator]: async function* () {
		for (const r of responses) yield r;
	},
});

const makeVoices = (count: number, offset = 0) =>
	Array.from({ length: count }, (_, i) => ({
		id: `v${offset + i}`,
		name: `Voice ${offset + i}`,
		language: "en",
		gender: "feminine",
		description: "voice",
		preview_file_url: null,
	}));

function makePage(data: object[], more = false) {
	return { data, has_more: more, next_page: more ? "cursor" : null };
}

const stubClient = { get: mockGet } as unknown as Cartesia;

describe("collectVoices", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns a single short page when has_more is false", async () => {
		mockGet.mockResolvedValue(makePage(makeVoices(30)));

		const voices = await collectVoices(stubClient, {}, 250);

		expect(voices).toHaveLength(30);
		expect(mockGet).toHaveBeenCalledTimes(1);
	});

	it("paginates past 100 using next_page cursor", async () => {
		mockGet
			.mockResolvedValueOnce({
				data: makeVoices(100),
				has_more: true,
				next_page: "cur1",
			})
			.mockResolvedValueOnce({
				data: makeVoices(100, 100),
				has_more: true,
				next_page: "cur2",
			})
			.mockResolvedValueOnce({
				data: makeVoices(50, 200),
				has_more: false,
				next_page: null,
			});

		const voices = await collectVoices(stubClient, {}, 250);

		expect(voices).toHaveLength(250);
		expect(voices[0].id).toBe("v0");
		expect(voices[249].id).toBe("v249");
		expect(mockGet).toHaveBeenCalledTimes(3);
		expect(mockGet).toHaveBeenNthCalledWith(
			2,
			"/voices",
			expect.objectContaining({
				query: expect.objectContaining({ starting_after: "cur1" }),
			}),
		);
		expect(mockGet).toHaveBeenNthCalledWith(
			3,
			"/voices",
			expect.objectContaining({
				query: expect.objectContaining({ starting_after: "cur2" }),
			}),
		);
	});

	it("stops at the limit even when has_more is true", async () => {
		mockGet.mockResolvedValue({
			data: makeVoices(100),
			has_more: true,
			next_page: "cur1",
		});

		const voices = await collectVoices(stubClient, {}, 100);

		expect(voices).toHaveLength(100);
		expect(mockGet).toHaveBeenCalledTimes(1);
	});

	it("stops when has_more becomes false mid-pagination", async () => {
		mockGet
			.mockResolvedValueOnce({
				data: makeVoices(100),
				has_more: true,
				next_page: "cur1",
			})
			.mockResolvedValueOnce({
				data: makeVoices(40, 100),
				has_more: false,
				next_page: null,
			});

		const voices = await collectVoices(stubClient, {}, 250);

		expect(voices).toHaveLength(140);
		expect(mockGet).toHaveBeenCalledTimes(2);
	});

	it("passes filter params through on every page request", async () => {
		mockGet
			.mockResolvedValueOnce({
				data: makeVoices(100),
				has_more: true,
				next_page: "cur1",
			})
			.mockResolvedValueOnce({
				data: makeVoices(10, 100),
				has_more: false,
				next_page: null,
			});

		const params = {
			q: "warm",
			gender: "feminine" as const,
			language: "en",
			expand: ["preview_file_url" as const],
		};
		await collectVoices(stubClient, params, 250);

		for (const [, options] of mockGet.mock.calls) {
			expect(options.query).toMatchObject(params);
		}
	});
});

describe("pcmDurationSec", () => {
	it("converts raw pcm_f32le byte length to seconds", () => {
		expect(pcmDurationSec(PCM_BYTES_PER_SEC)).toBe(1);
		expect(pcmDurationSec(PCM_BYTES_PER_SEC / 2)).toBe(0.5);
		expect(pcmDurationSec(0)).toBe(0);
	});
});

describe("CartesiaTTS", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockCacheStore.clear();
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

		it("reports duration from the audio length, not the last word timestamp", async () => {
			mockGenerate.mockReturnValue(
				streamOf([
					{ type: "chunk", audio: pcmChunk(2) },
					{
						type: "timestamps",
						word_timestamps: {
							words: ["hello"],
							start: [0.0],
							end: [0.4],
						},
					},
					{ type: "done", done: true },
				]),
			);

			const provider = new CartesiaTTS("test-key");
			const result = await provider.generate({
				prompt: "hello",
				voiceId: "voice-1",
			});

			expect(result.metadata?.durationSec).toBe(3);
		});

		it("reports duration even when the model returns no timestamps", async () => {
			mockGenerate.mockReturnValue(
				streamOf([
					{ type: "chunk", audio: pcmChunk(3) },
					{ type: "done", done: true },
				]),
			);

			const provider = new CartesiaTTS("test-key");
			const result = await provider.generate({
				prompt: "hello",
				voiceId: "voice-1",
			});

			expect(result.metadata?.durationSec).toBe(4);
		});

		it("throws when the stream yields no audio", async () => {
			mockGenerate.mockReturnValue(streamOf([{ type: "done", done: true }]));

			const provider = new CartesiaTTS("test-key");
			await expect(
				provider.generate({ prompt: "hello", voiceId: "voice-1" }),
			).rejects.toThrow("Cartesia returned no audio for voice voice-1");
			expect(mockClose).toHaveBeenCalled();
		});

		it("passes custom model", async () => {
			mockGenerate.mockReturnValue(
				streamOf([
					{ type: "chunk", audio: pcmChunk(1) },
					{ type: "done", done: true },
				]),
			);

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

		it("forwards emotion controls to Cartesia", async () => {
			mockGenerate.mockReturnValue(
				streamOf([
					{ type: "chunk", audio: pcmChunk(1) },
					{ type: "done", done: true },
				]),
			);

			const provider = new CartesiaTTS("test-key");
			await provider.generate({
				prompt: "test",
				voiceId: "v1",
				emotion: TTSEmotion.Excited,
			});

			expect(mockGenerate).toHaveBeenCalledWith(
				expect.objectContaining({
					generation_config: expect.objectContaining({ emotion: "excited" }),
				}),
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
			mockGet.mockResolvedValue(
				makePage([
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
				]),
			);

			const provider = new CartesiaTTS("test-key");
			const voices = await provider.search({ language: "en" });

			expect(voices).toEqual([
				{
					id: "v1",
					name: "English Voice",
					language: "en",
					gender: "feminine",
					description: "A warm voice",
					previewUrl: `/api/v1/tts/voices/preview?url=${encodeURIComponent("https://preview.mp3")}`,
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
			expect(mockGet).toHaveBeenCalledWith(
				"/voices",
				expect.objectContaining({
					query: expect.objectContaining({
						limit: 100,
						expand: ["preview_file_url"],
					}),
				}),
			);
		});

		it("passes gender filter and always fetches a full page from upstream", async () => {
			mockGet.mockResolvedValue(makePage([]));

			const provider = new CartesiaTTS("test-key");
			await provider.search({ gender: "masculine", limit: 5 });

			expect(mockGet).toHaveBeenCalledWith(
				"/voices",
				expect.objectContaining({
					query: expect.objectContaining({
						gender: "masculine",
						limit: 100,
						expand: ["preview_file_url"],
					}),
				}),
			);
		});

		it("applies limit after upstream + ranking", async () => {
			mockGet.mockResolvedValue(makePage(makeVoices(10)));

			const provider = new CartesiaTTS("test-key");
			const result = await provider.search({ limit: 3 });

			expect(result).toHaveLength(3);
		});

		it("aggregates voices across multiple pages", async () => {
			mockGet
				.mockResolvedValueOnce({
					data: makeVoices(100),
					has_more: true,
					next_page: "cur1",
				})
				.mockResolvedValueOnce({
					data: makeVoices(50, 100),
					has_more: false,
					next_page: null,
				});

			const provider = new CartesiaTTS("test-key");
			const voices = await provider.search({});

			expect(voices).toHaveLength(150);
			expect(mockGet).toHaveBeenCalledTimes(2);
		});

		it("serves a repeat search with identical params from cache", async () => {
			mockGet.mockResolvedValue(makePage(makeVoices(10)));
			const provider = new CartesiaTTS("test-key");

			await provider.search({ gender: "feminine", language: "en" });
			await provider.search({ gender: "feminine", language: "en" });

			expect(mockGet).toHaveBeenCalledTimes(1);
		});

		it("does not reuse cache across different params", async () => {
			mockGet.mockResolvedValue(makePage(makeVoices(10)));
			const provider = new CartesiaTTS("test-key");

			await provider.search({ gender: "feminine" });
			await provider.search({ gender: "masculine" });

			expect(mockGet).toHaveBeenCalledTimes(2);
		});

		it("re-ranks voices by description similarity when semantic descriptors provided", async () => {
			mockGet.mockResolvedValue(
				makePage([
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
				]),
			);
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
					values: ["Cold cold robotic voice", "Warm warm british narrator"],
				}),
			);
		});

		it("embeds a non-empty string when a voice description is empty", async () => {
			mockGet.mockResolvedValue(
				makePage([
					{
						id: "v1",
						name: "Nameless",
						language: "en",
						gender: "feminine",
						description: "",
						preview_file_url: null,
					},
				]),
			);
			mockEmbed.mockResolvedValue({ embedding: [1, 0] });
			mockEmbedMany.mockResolvedValue({ embeddings: [[1, 0]] });

			const provider = new CartesiaTTS("test-key");
			await provider.search({ description: "warm" });

			expect(mockEmbedMany).toHaveBeenCalledWith(
				expect.objectContaining({ values: ["Nameless "] }),
			);
		});

		it("skips embedding when no semantic descriptors provided", async () => {
			mockGet.mockResolvedValue(
				makePage([
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
				]),
			);

			const provider = new CartesiaTTS("test-key");
			const voices = await provider.search({ gender: "masculine" });

			expect(voices.map((v) => v.id)).toEqual(["v1", "v2"]);
			expect(mockEmbed).not.toHaveBeenCalled();
			expect(mockEmbedMany).not.toHaveBeenCalled();
		});

		it("returns early without embedding when semantic query exists but no voices match", async () => {
			mockGet.mockResolvedValue(makePage([]));

			const provider = new CartesiaTTS("test-key");
			const voices = await provider.search({ description: "warm narrator" });

			expect(voices).toEqual([]);
			expect(mockEmbed).not.toHaveBeenCalled();
			expect(mockEmbedMany).not.toHaveBeenCalled();
		});

		it("falls back to unranked results when embedding throws", async () => {
			mockGet.mockResolvedValue(
				makePage([
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
				]),
			);
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

		it("passes language filter to the API", async () => {
			mockGet.mockResolvedValue(makePage(makeVoices(5)));

			const provider = new CartesiaTTS("test-key");
			await provider.search({ language: "en" });

			expect(mockGet).toHaveBeenCalledWith(
				"/voices",
				expect.objectContaining({
					query: expect.objectContaining({ language: "en" }),
				}),
			);
		});
	});
});
