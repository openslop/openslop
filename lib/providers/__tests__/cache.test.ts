import { beforeEach, describe, expect, it, vi } from "vitest";

const mockQuery = vi.fn();
const mockUpsert = vi.fn();
const mockNamespace = vi.fn(() => ({ query: mockQuery, upsert: mockUpsert }));
const mockIndex = vi.fn(() => ({ namespace: mockNamespace }));

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

describe("pineconeCache", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		process.env.PINECONE_API_KEY = "test-key";
		mockEmbed.mockResolvedValue([0.1, 0.2, 0.3]);
	});

	it("is a no-op when PINECONE_API_KEY is unset", async () => {
		delete process.env.PINECONE_API_KEY;
		const { pineconeCache } = await loadCache();

		const inner = vi.fn().mockResolvedValue("fresh");
		const wrapped = pineconeCache(inner, {
			index: "i",
			toMetadata: () => ({}),
			fromMetadata: () => "cached",
		});

		expect(wrapped).toBe(inner);
		await wrapped("x");
		expect(inner).toHaveBeenCalledWith("x");
		expect(mockEmbed).not.toHaveBeenCalled();
	});

	it("returns cached value on hit above threshold", async () => {
		const { pineconeCache } = await loadCache();
		mockQuery.mockResolvedValue({
			matches: [{ score: 0.95, metadata: { url: "u", duration: 5 } }],
		});

		const inner = vi.fn().mockResolvedValue({ fresh: true });
		const wrapped = pineconeCache<[string], { cached: boolean }>(inner, {
			index: "i",
			threshold: 0.9,
			serialize: (s) => s,
			toMetadata: () => ({}),
			fromMetadata: (m) => ({ cached: true, url: String(m.url) }) as never,
		});

		const result = await wrapped("hello");
		expect(result).toEqual({ cached: true, url: "u" });
		expect(inner).not.toHaveBeenCalled();
		expect(mockUpsert).not.toHaveBeenCalled();
		expect(mockEmbed).toHaveBeenCalledWith("hello");
	});

	it("falls through when fromMetadata cannot rehydrate the matched row", async () => {
		const { pineconeCache } = await loadCache();
		mockQuery.mockResolvedValue({
			matches: [{ score: 0.95, metadata: { duration: 5 } }],
		});
		mockUpsert.mockResolvedValue(undefined);

		const inner = vi.fn().mockResolvedValue("fresh");
		const wrapped = pineconeCache<[string], string>(inner, {
			index: "i",
			threshold: 0.9,
			serialize: (s) => s,
			toMetadata: () => ({}),
			fromMetadata: () => undefined,
		});

		expect(await wrapped("hello")).toBe("fresh");
		expect(inner).toHaveBeenCalledWith("hello");
	});

	it("falls through on score below threshold and upserts result", async () => {
		const { pineconeCache } = await loadCache();
		mockQuery.mockResolvedValue({
			matches: [{ score: 0.5, metadata: { url: "old" } }],
		});
		mockUpsert.mockResolvedValue(undefined);

		const inner = vi.fn().mockResolvedValue("fresh-result");
		const wrapped = pineconeCache<[string], string>(inner, {
			index: "i",
			threshold: 0.9,
			serialize: (s) => s,
			toMetadata: (r, description) => ({ value: r, description }),
			fromMetadata: (m) => String(m.value),
		});

		const result = await wrapped("query");
		expect(result).toBe("fresh-result");
		expect(inner).toHaveBeenCalledWith("query");
		expect(mockUpsert).toHaveBeenCalledWith({
			records: [
				expect.objectContaining({
					values: [0.1, 0.2, 0.3],
					metadata: { value: "fresh-result", description: "query" },
				}),
			],
		});
	});

	it("falls through when no matches at all", async () => {
		const { pineconeCache } = await loadCache();
		mockQuery.mockResolvedValue({ matches: [] });
		mockUpsert.mockResolvedValue(undefined);

		const inner = vi.fn().mockResolvedValue("fresh");
		const wrapped = pineconeCache<[string], string>(inner, {
			index: "i",
			toMetadata: () => ({}),
			fromMetadata: () => "cached",
			serialize: (s) => s,
		});

		expect(await wrapped("q")).toBe("fresh");
		expect(inner).toHaveBeenCalled();
		expect(mockUpsert).toHaveBeenCalled();
	});

	it("swallows query errors and falls through to the hot path", async () => {
		const { pineconeCache } = await loadCache();
		mockQuery.mockRejectedValue(new Error("pinecone down"));
		mockUpsert.mockResolvedValue(undefined);

		const inner = vi.fn().mockResolvedValue("fresh");
		const wrapped = pineconeCache<[string], string>(inner, {
			index: "i",
			toMetadata: () => ({ v: "stored" }),
			fromMetadata: () => "cached",
			serialize: (s) => s,
		});

		const result = await wrapped("q");
		expect(result).toBe("fresh");
		expect(inner).toHaveBeenCalledWith("q");
		// vector embedded successfully, so write is still attempted
		expect(mockUpsert).toHaveBeenCalled();
	});

	it("swallows index-not-found errors and falls through", async () => {
		const { pineconeCache } = await loadCache();
		mockQuery.mockRejectedValue(
			Object.assign(new Error("Index not found"), {
				name: "PineconeNotFoundError",
			}),
		);
		mockUpsert.mockRejectedValue(new Error("index missing"));

		const inner = vi.fn().mockResolvedValue("fresh");
		const wrapped = pineconeCache<[string], string>(inner, {
			index: "i",
			toMetadata: () => ({}),
			fromMetadata: () => "cached",
			serialize: (s) => s,
		});

		const result = await wrapped("q");
		expect(result).toBe("fresh");
		expect(inner).toHaveBeenCalled();
	});

	it("swallows embed errors and skips write entirely", async () => {
		const { pineconeCache } = await loadCache();
		mockEmbed.mockRejectedValue(new Error("openai down"));

		const inner = vi.fn().mockResolvedValue("fresh");
		const wrapped = pineconeCache<[string], string>(inner, {
			index: "i",
			toMetadata: () => ({}),
			fromMetadata: () => "cached",
			serialize: (s) => s,
		});

		const result = await wrapped("q");
		expect(result).toBe("fresh");
		expect(inner).toHaveBeenCalled();
		expect(mockQuery).not.toHaveBeenCalled();
		expect(mockUpsert).not.toHaveBeenCalled();
	});

	it("logs but does not throw on write failure", async () => {
		const { pineconeCache } = await loadCache();
		mockQuery.mockResolvedValue({ matches: [] });
		mockUpsert.mockRejectedValue(new Error("upsert failed"));

		const inner = vi.fn().mockResolvedValue("fresh");
		const wrapped = pineconeCache<[string], string>(inner, {
			index: "i",
			toMetadata: () => ({}),
			fromMetadata: () => "x",
			serialize: (s) => s,
		});

		const result = await wrapped("q");
		expect(result).toBe("fresh");
		expect(mockUpsert).toHaveBeenCalled();
	});

	it("default threshold is 0.8", async () => {
		const { pineconeCache } = await loadCache();
		mockQuery.mockResolvedValue({
			matches: [{ score: 0.79, metadata: { v: "cached" } }],
		});
		mockUpsert.mockResolvedValue(undefined);

		const inner = vi.fn().mockResolvedValue("fresh");
		const wrapped = pineconeCache<[string], string>(inner, {
			index: "i",
			serialize: (s) => s,
			toMetadata: () => ({}),
			fromMetadata: (m) => String(m.v),
		});

		expect(await wrapped("q")).toBe("fresh"); // below default 0.8 -> miss
	});

	it("default serialize uses JSON.stringify of args", async () => {
		const { pineconeCache } = await loadCache();
		mockQuery.mockResolvedValue({ matches: [] });
		mockUpsert.mockResolvedValue(undefined);

		const wrapped = pineconeCache<[{ a: number; b: string }], string>(
			vi.fn().mockResolvedValue("fresh"),
			{
				index: "i",
				toMetadata: () => ({}),
				fromMetadata: () => "x",
			},
		);

		await wrapped({ a: 1, b: "hi" });
		expect(mockEmbed).toHaveBeenCalledWith(JSON.stringify([{ a: 1, b: "hi" }]));
	});

	it("preserves `this` binding to the original method", async () => {
		const { pineconeCache } = await loadCache();
		mockQuery.mockResolvedValue({ matches: [] });
		mockUpsert.mockResolvedValue(undefined);

		class Box {
			value = 42;
			async getValue(this: Box) {
				return this.value;
			}
		}
		Box.prototype.getValue = pineconeCache<[], number, Box>(
			Box.prototype.getValue,
			{
				index: "i",
				toMetadata: (r) => ({ v: r }),
				fromMetadata: (m) => Number(m.v),
				serialize: () => "static-key",
			},
		);

		expect(await new Box().getValue()).toBe(42);
	});

	it("passes namespace through to pinecone", async () => {
		const { pineconeCache } = await loadCache();
		pineconeCache(vi.fn(), {
			index: "i",
			namespace: "tenant-a",
			toMetadata: () => ({}),
			fromMetadata: () => null,
		});
		expect(mockIndex).toHaveBeenCalledWith("i");
		expect(mockNamespace).toHaveBeenCalledWith("tenant-a");
	});

	it("fetches multiple candidates and forwards them to rank", async () => {
		const { pineconeCache } = await loadCache();
		const candidateA = { score: 0.95, metadata: { value: "a" } };
		const candidateB = { score: 0.92, metadata: { value: "b" } };
		mockQuery.mockResolvedValue({ matches: [candidateA, candidateB] });

		const rank = vi.fn().mockReturnValue(candidateB);
		const wrapped = pineconeCache<[string], string>(
			vi.fn().mockResolvedValue("fresh"),
			{
				index: "i",
				toMetadata: () => ({}),
				fromMetadata: (m) => String(m.value),
				serialize: (s) => s,
				rank,
			},
		);

		expect(await wrapped("q")).toBe("b");
		expect(mockQuery).toHaveBeenCalledWith(
			expect.objectContaining({ topK: 5 }),
		);
		expect(rank).toHaveBeenCalledWith([candidateA, candidateB], "q");
	});

	it("rank receives only candidates above threshold", async () => {
		const { pineconeCache } = await loadCache();
		mockQuery.mockResolvedValue({
			matches: [
				{ score: 0.95, metadata: { v: "good" } },
				{ score: 0.5, metadata: { v: "bad" } },
			],
		});

		const rank = vi.fn((cs) => cs[0]);
		const wrapped = pineconeCache<[string], string>(
			vi.fn().mockResolvedValue("fresh"),
			{
				index: "i",
				threshold: 0.9,
				toMetadata: () => ({}),
				fromMetadata: (m) => String(m.v),
				serialize: (s) => s,
				rank,
			},
		);

		await wrapped("q");
		expect(rank.mock.calls[0][0]).toHaveLength(1);
		expect(rank.mock.calls[0][0][0].metadata).toEqual({ v: "good" });
	});

	it("rank returning undefined forces a miss", async () => {
		const { pineconeCache } = await loadCache();
		mockQuery.mockResolvedValue({
			matches: [{ score: 0.99, metadata: { v: "cached" } }],
		});
		mockUpsert.mockResolvedValue(undefined);

		const inner = vi.fn().mockResolvedValue("fresh");
		const wrapped = pineconeCache<[string], string>(inner, {
			index: "i",
			toMetadata: () => ({}),
			fromMetadata: () => "cached",
			serialize: (s) => s,
			rank: () => undefined,
		});

		expect(await wrapped("q")).toBe("fresh");
		expect(inner).toHaveBeenCalled();
	});
});

describe("rankByNearestDuration", () => {
	it("picks the candidate closest to the requested duration", async () => {
		const { rankByNearestDuration } = await loadCache();
		const picked = rankByNearestDuration(
			[
				{ score: 0.95, metadata: { duration: 5 } },
				{ score: 0.94, metadata: { duration: 28 } },
				{ score: 0.93, metadata: { duration: 60 } },
			],
			{ durationSeconds: 30 },
		);
		expect(picked?.metadata?.duration).toBe(28);
	});

	it("falls back to the top similarity match when no target duration", async () => {
		const { rankByNearestDuration } = await loadCache();
		const picked = rankByNearestDuration(
			[
				{ score: 0.95, metadata: { duration: 5 } },
				{ score: 0.94, metadata: { duration: 60 } },
			],
			{},
		);
		expect(picked?.metadata?.duration).toBe(5);
	});

	it("returns undefined for an empty candidate list", async () => {
		const { rankByNearestDuration } = await loadCache();
		expect(rankByNearestDuration([], { durationSeconds: 30 })).toBeUndefined();
	});

	it("treats missing duration metadata as 0", async () => {
		const { rankByNearestDuration } = await loadCache();
		const picked = rankByNearestDuration(
			[
				{ score: 0.95, metadata: {} },
				{ score: 0.94, metadata: { duration: 30 } },
			],
			{ durationSeconds: 28 },
		);
		expect(picked?.metadata?.duration).toBe(30);
	});
});

describe("audioBundleCache", () => {
	it("round-trips a BundleResponse with an absolute URL through metadata", async () => {
		const { audioBundleCache } = await loadCache();
		const cache = audioBundleCache("music");
		const m = cache.toMetadata(
			{
				id: "abc",
				type: "music",
				provider: "elevenlabs",
				result: { audio: "https://blob/audio.mp3" },
				metadata: { durationSec: 12.5 },
			},
			"happy piano",
		);
		// Absolute URL passes through AssetBundle.resolve unchanged.
		expect(m).toEqual({
			url: "https://blob/audio.mp3",
			duration: 12.5,
			description: "happy piano",
		});

		const restored = cache.fromMetadata(m);
		expect(restored?.result.audio).toBe("https://blob/audio.mp3");
		expect(restored?.metadata).toMatchObject({
			durationSec: 12.5,
			cached: true,
			description: "happy piano",
		});
		expect(restored?.provider).toBe("pinecone-cache");
	});

	it("resolves the filename to an absolute URL when r.result.audio is a relative filename", async () => {
		const { audioBundleCache } = await loadCache();
		const { AssetBundle } = await import("@/lib/api/asset-bundle");
		const m = audioBundleCache("music").toMetadata(
			{
				id: "abc123",
				type: "music",
				provider: "elevenlabs",
				result: { audio: "output.mp3" },
				metadata: { durationSec: 30 },
			},
			"jazz",
		);
		const expected = `${AssetBundle.baseUrl}/assets/music/elevenlabs/abc123/output.mp3`;
		expect(m.url).toBe(expected);
	});

	it("resolves under the namespace the response was written to", async () => {
		const { audioBundleCache } = await loadCache();
		const m = audioBundleCache("sfx").toMetadata(
			{
				id: "id",
				type: "sfx",
				provider: "elevenlabs",
				result: { audio: "out.mp3" },
				metadata: { durationSec: 1 },
			},
			"crash",
		);
		expect(m.url).toContain("/assets/sfx/elevenlabs/id/out.mp3");
	});

	it("fromMetadata reads pre-existing audioUrl field for backwards compatibility", async () => {
		const { audioBundleCache } = await loadCache();
		const restored = audioBundleCache("music").fromMetadata({
			audioUrl: "https://legacy/audio.mp3",
			duration: 5,
			description: "old record",
		});
		expect(restored?.result.audio).toBe("https://legacy/audio.mp3");
		expect(restored?.id).toBe("https://legacy/audio.mp3");
	});

	it("fromMetadata forces a miss when the row carries no URL", async () => {
		const { audioBundleCache } = await loadCache();
		const cache = audioBundleCache("music");
		expect(cache.fromMetadata({ duration: 5, description: "no url" })).toBe(
			undefined,
		);
		expect(cache.fromMetadata({ url: "", duration: 5 })).toBe(undefined);
	});

	it("fromMetadata forces a miss when the row has no usable duration", async () => {
		const { audioBundleCache } = await loadCache();
		const cache = audioBundleCache("music");
		expect(
			cache.fromMetadata({ url: "https://a/audio.mp3", description: "d" }),
		).toBe(undefined);
		expect(
			cache.fromMetadata({
				url: "https://a/audio.mp3",
				duration: "not a number",
				description: "d",
			}),
		).toBe(undefined);
	});

	it("defaults duration to 0 when metadata missing", async () => {
		const { audioBundleCache } = await loadCache();
		const m = audioBundleCache("music").toMetadata(
			{ id: "x", type: "music", provider: "p", result: { audio: "u" } },
			"desc",
		);
		expect(m.duration).toBe(0);
	});
});
