import { beforeEach, describe, expect, it, vi } from "vitest";
import type { BundleResponse } from "@/lib/api/assetBundle";

const mockQuery = vi.fn();
const mockUpsert = vi.fn();
const mockIndex = vi.fn(() => ({ query: mockQuery, upsert: mockUpsert }));

vi.mock("@pinecone-database/pinecone", () => ({
	Pinecone: class {
		index = mockIndex;
	},
}));

const mockEmbed = vi.fn();
vi.mock("../embed", () => ({
	embedText: (text: string) => mockEmbed(text),
}));

async function loadCache() {
	vi.resetModules();
	return import("../cache");
}

const bundle = (audio: string, durationSec?: number): BundleResponse => ({
	id: "fresh-id",
	type: "music",
	provider: "elevenlabs",
	result: { audio },
	metadata: durationSec == null ? undefined : { durationSec },
});

const row = (url: string, duration: number) => ({
	score: 0.95,
	metadata: { url, duration, description: "d" },
});

describe("audioPromptCache", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		process.env.PINECONE_API_KEY = "test-key";
		mockEmbed.mockResolvedValue([0.1, 0.2, 0.3]);
		mockUpsert.mockResolvedValue(undefined);
	});

	it("produces without touching Pinecone when PINECONE_API_KEY is unset", async () => {
		delete process.env.PINECONE_API_KEY;
		const { audioPromptCache } = await loadCache();
		const produce = vi.fn().mockResolvedValue(bundle("https://blob/a.mp3"));

		const result = await audioPromptCache("i", "music").readThrough(
			{ prompt: "jazz" },
			produce,
		);

		expect(result.result.audio).toBe("https://blob/a.mp3");
		expect(produce).toHaveBeenCalledOnce();
		expect(mockIndex).not.toHaveBeenCalled();
		expect(mockEmbed).not.toHaveBeenCalled();
	});

	it("targets the named index", async () => {
		const { audioPromptCache } = await loadCache();
		audioPromptCache("sfx-eu", "sfx");
		expect(mockIndex).toHaveBeenCalledWith({ name: "sfx-eu" });
	});

	it("serves a similar-enough row without producing", async () => {
		const { audioPromptCache } = await loadCache();
		mockQuery.mockResolvedValue({
			matches: [row("https://blob/cached.mp3", 5)],
		});
		const produce = vi.fn();

		const result = await audioPromptCache("i", "music").readThrough(
			{ prompt: "jazz" },
			produce,
		);

		expect(result).toEqual({
			id: "https://blob/cached.mp3",
			type: "music",
			provider: "pinecone-cache",
			result: { audio: "https://blob/cached.mp3" },
			metadata: { durationSec: 5, cached: true, description: "d" },
		});
		expect(produce).not.toHaveBeenCalled();
		expect(mockUpsert).not.toHaveBeenCalled();
		expect(mockEmbed).toHaveBeenCalledWith("jazz");
		expect(mockQuery).toHaveBeenCalledWith({
			vector: [0.1, 0.2, 0.3],
			topK: 5,
			includeMetadata: true,
		});
	});

	it("embeds the prompt alone, never the duration", async () => {
		const { audioPromptCache } = await loadCache();
		mockQuery.mockResolvedValue({ matches: [] });

		await audioPromptCache("i", "music").readThrough(
			{ prompt: "jazz", durationSeconds: 30 },
			vi.fn().mockResolvedValue(bundle("u")),
		);

		expect(mockEmbed).toHaveBeenCalledWith("jazz");
	});

	it("produces and stores the result when the nearest row cannot be rehydrated", async () => {
		const { audioPromptCache } = await loadCache();
		mockQuery.mockResolvedValue({
			matches: [{ score: 0.95, metadata: { duration: 5 } }],
		});
		const produce = vi.fn().mockResolvedValue(bundle("https://blob/a.mp3", 7));

		const result = await audioPromptCache("i", "music").readThrough(
			{ prompt: "jazz" },
			produce,
		);

		expect(result.result.audio).toBe("https://blob/a.mp3");
		expect(produce).toHaveBeenCalledOnce();
		expect(mockUpsert).toHaveBeenCalledWith({
			records: [
				expect.objectContaining({
					values: [0.1, 0.2, 0.3],
					metadata: {
						url: "https://blob/a.mp3",
						duration: 7,
						description: "jazz",
					},
				}),
			],
		});
	});

	it("produces and stores when nothing matches", async () => {
		const { audioPromptCache } = await loadCache();
		mockQuery.mockResolvedValue({ matches: [] });
		const produce = vi.fn().mockResolvedValue(bundle("u"));

		await audioPromptCache("i", "music").readThrough(
			{ prompt: "jazz" },
			produce,
		);

		expect(produce).toHaveBeenCalledOnce();
		expect(mockUpsert).toHaveBeenCalledOnce();
	});

	it("falls through a failed read and still stores the result", async () => {
		const { audioPromptCache } = await loadCache();
		mockQuery.mockRejectedValue(new Error("pinecone down"));
		const produce = vi.fn().mockResolvedValue(bundle("u"));

		const result = await audioPromptCache("i", "music").readThrough(
			{ prompt: "jazz" },
			produce,
		);

		expect(result.result.audio).toBe("u");
		expect(mockUpsert).toHaveBeenCalledOnce();
	});

	it("skips the read and the write when embedding fails", async () => {
		const { audioPromptCache } = await loadCache();
		mockEmbed.mockRejectedValue(new Error("openai down"));
		const produce = vi.fn().mockResolvedValue(bundle("u"));

		const result = await audioPromptCache("i", "music").readThrough(
			{ prompt: "jazz" },
			produce,
		);

		expect(result.result.audio).toBe("u");
		expect(mockQuery).not.toHaveBeenCalled();
		expect(mockUpsert).not.toHaveBeenCalled();
	});

	it("returns the produced result when the write fails", async () => {
		const { audioPromptCache } = await loadCache();
		mockQuery.mockResolvedValue({ matches: [] });
		mockUpsert.mockRejectedValue(new Error("upsert failed"));

		const result = await audioPromptCache("i", "music").readThrough(
			{ prompt: "jazz" },
			vi.fn().mockResolvedValue(bundle("u")),
		);

		expect(result.result.audio).toBe("u");
	});
});

describe("bestMatch", () => {
	it("picks the match closest to the requested duration", async () => {
		const { bestMatch } = await loadCache();
		const picked = bestMatch(
			[
				{ score: 0.95, metadata: { duration: 5 } },
				{ score: 0.94, metadata: { duration: 28 } },
				{ score: 0.93, metadata: { duration: 60 } },
			],
			30,
		);
		expect(picked?.metadata?.duration).toBe(28);
	});

	it("falls back to the most similar match when no duration was requested", async () => {
		const { bestMatch } = await loadCache();
		const picked = bestMatch(
			[
				{ score: 0.95, metadata: { duration: 5 } },
				{ score: 0.94, metadata: { duration: 60 } },
			],
			undefined,
		);
		expect(picked?.metadata?.duration).toBe(5);
	});

	it("only considers matches at or above the similarity threshold", async () => {
		const { bestMatch } = await loadCache();
		const matches = [
			{ score: 0.79, metadata: { duration: 30 } },
			{ score: 0.8, metadata: { duration: 5 } },
		];
		expect(bestMatch(matches, 30)?.metadata?.duration).toBe(5);
		expect(bestMatch(matches, undefined)?.metadata?.duration).toBe(5);
		expect(bestMatch([matches[0]], 30)).toBeUndefined();
	});

	it("returns undefined for an empty list", async () => {
		const { bestMatch } = await loadCache();
		expect(bestMatch([], 30)).toBeUndefined();
	});

	it("treats a missing duration as 0", async () => {
		const { bestMatch } = await loadCache();
		const picked = bestMatch(
			[
				{ score: 0.95, metadata: {} },
				{ score: 0.94, metadata: { duration: 30 } },
			],
			28,
		);
		expect(picked?.metadata?.duration).toBe(30);
	});
});

describe("audio rows", () => {
	it("round-trips a BundleResponse with an absolute URL", async () => {
		const { toAudioRow, fromAudioRow } = await loadCache();
		const m = toAudioRow(
			{
				id: "abc",
				type: "music",
				provider: "elevenlabs",
				result: { audio: "https://blob/audio.mp3" },
				metadata: { durationSec: 12.5 },
			},
			"happy piano",
		);
		expect(m).toEqual({
			url: "https://blob/audio.mp3",
			duration: 12.5,
			description: "happy piano",
		});

		const restored = fromAudioRow(m, "music");
		expect(restored?.result.audio).toBe("https://blob/audio.mp3");
		expect(restored?.type).toBe("music");
		expect(restored?.provider).toBe("pinecone-cache");
		expect(restored?.metadata).toMatchObject({
			durationSec: 12.5,
			cached: true,
			description: "happy piano",
		});
	});

	it("resolves a relative filename to an absolute URL under the bundle's path", async () => {
		const { toAudioRow } = await loadCache();
		const { AssetBundle } = await import("@/lib/api/assetBundle");
		const m = toAudioRow(
			{
				id: "abc123",
				type: "music",
				provider: "elevenlabs",
				result: { audio: "output.mp3" },
				metadata: { durationSec: 30 },
			},
			"jazz",
		);
		expect(m.url).toBe(
			`${AssetBundle.baseUrl}/assets/music/elevenlabs/abc123/output.mp3`,
		);
	});

	it("defaults the duration to 0 when the bundle has none", async () => {
		const { toAudioRow } = await loadCache();
		const m = toAudioRow(
			{ id: "x", type: "music", provider: "p", result: { audio: "u" } },
			"desc",
		);
		expect(m.duration).toBe(0);
	});

	it("reads the legacy audioUrl key", async () => {
		const { fromAudioRow } = await loadCache();
		const restored = fromAudioRow(
			{
				audioUrl: "https://legacy/audio.mp3",
				duration: 5,
				description: "old record",
			},
			"music",
		);
		expect(restored?.result.audio).toBe("https://legacy/audio.mp3");
		expect(restored?.id).toBe("https://legacy/audio.mp3");
	});

	it("rejects a row missing a url, a description or a numeric duration", async () => {
		const { fromAudioRow } = await loadCache();
		expect(
			fromAudioRow({ duration: 5, description: "no url" }, "music"),
		).toBeUndefined();
		expect(
			fromAudioRow({ url: "", duration: 5, description: "d" }, "music"),
		).toBeUndefined();
		expect(
			fromAudioRow({ url: "https://a/audio.mp3", duration: 5 }, "music"),
		).toBeUndefined();
		expect(
			fromAudioRow({ url: "https://a/audio.mp3", description: "d" }, "music"),
		).toBeUndefined();
		expect(
			fromAudioRow(
				{ url: "https://a/audio.mp3", duration: "n/a", description: "d" },
				"music",
			),
		).toBeUndefined();
	});
});
