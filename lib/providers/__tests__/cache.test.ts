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
		const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});

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
		expect(errSpy).toHaveBeenCalledWith(
			"[pinecone-cache] read failed; falling through",
			expect.any(Error),
		);
		// vector embedded successfully, so write is still attempted
		expect(mockUpsert).toHaveBeenCalled();
		errSpy.mockRestore();
	});

	it("swallows index-not-found errors and falls through", async () => {
		const { pineconeCache } = await loadCache();
		mockQuery.mockRejectedValue(
			Object.assign(new Error("Index not found"), {
				name: "PineconeNotFoundError",
			}),
		);
		mockUpsert.mockRejectedValue(new Error("index missing"));
		const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});

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
		errSpy.mockRestore();
	});

	it("swallows embed errors and skips write entirely", async () => {
		const { pineconeCache } = await loadCache();
		mockEmbed.mockRejectedValue(new Error("openai down"));
		const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});

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
		errSpy.mockRestore();
	});

	it("logs but does not throw on write failure", async () => {
		const { pineconeCache } = await loadCache();
		mockQuery.mockResolvedValue({ matches: [] });
		mockUpsert.mockRejectedValue(new Error("upsert failed"));
		const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		const inner = vi.fn().mockResolvedValue("fresh");
		const wrapped = pineconeCache<[string], string>(inner, {
			index: "i",
			toMetadata: () => ({}),
			fromMetadata: () => "x",
			serialize: (s) => s,
		});

		const result = await wrapped("q");
		expect(result).toBe("fresh");
		expect(errSpy).toHaveBeenCalledWith(
			"[pinecone-cache] write failed",
			expect.any(Error),
		);
		errSpy.mockRestore();
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
});

describe("audioBundleCache", () => {
	it("round-trips a BundleResponse through metadata", async () => {
		const { audioBundleCache } = await loadCache();
		const m = audioBundleCache.toMetadata(
			{
				id: "abc",
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

		const restored = audioBundleCache.fromMetadata(m);
		expect(restored.result.audio).toBe("https://blob/audio.mp3");
		expect(restored.metadata).toMatchObject({
			durationSec: 12.5,
			cached: true,
			description: "happy piano",
		});
		expect(restored.provider).toBe("pinecone-cache");
	});

	it("defaults duration to 0 when metadata missing", async () => {
		const { audioBundleCache } = await loadCache();
		const m = audioBundleCache.toMetadata(
			{ id: "x", provider: "p", result: { audio: "u" } },
			"desc",
		);
		expect(m.duration).toBe(0);
	});
});
