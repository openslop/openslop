import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { AssetBundle } from "../asset-bundle";
import type { BundleResponse } from "../asset-bundle";

describe("AssetBundle", () => {
	describe("buildUrl", () => {
		beforeEach(() => {
			AssetBundle.baseUrl = "https://blob.example.com";
		});

		it("constructs url from type, provider, and id", () => {
			const url = AssetBundle.buildUrl("image", "runware", "abc123");
			expect(url).toBe("https://blob.example.com/assets/image/runware/abc123");
		});

		it("handles empty baseUrl", () => {
			AssetBundle.baseUrl = "";
			const url = AssetBundle.buildUrl("video", "mock", "xyz");
			expect(url).toBe("/assets/video/mock/xyz");
		});
	});

	describe("resolve", () => {
		it("resolves relative path against bundle url", () => {
			const bundle = new AssetBundle(
				"https://blob.example.com/assets/image/runware/abc",
				{
					result: { image: "output.png" },
				},
			);
			expect(bundle.resolve("image")).toBe(
				"https://blob.example.com/assets/image/runware/abc/output.png",
			);
		});

		it("returns absolute urls as-is", () => {
			const bundle = new AssetBundle(
				"https://blob.example.com/assets/video/mock/xyz",
				{
					result: { video: "https://cdn.example.com/video.mp4" },
				},
			);
			expect(bundle.resolve("video")).toBe("https://cdn.example.com/video.mp4");
		});

		it("throws for unknown key", () => {
			const bundle = new AssetBundle("https://blob.example.com/x", {
				result: {},
			});
			expect(() => bundle.resolve("missing")).toThrow('No file "missing"');
		});
	});

	describe("fromResponse", () => {
		beforeEach(() => {
			AssetBundle.baseUrl = "https://blob.example.com";
		});

		it("creates bundle from a BundleResponse", () => {
			const response: BundleResponse = {
				id: "abc",
				type: "image",
				provider: "runware",
				result: { image: "output.png" },
			};
			const bundle = AssetBundle.fromResponse(response);
			expect(bundle.resolve("image")).toBe(
				"https://blob.example.com/assets/image/runware/abc/output.png",
			);
		});
	});

	describe("fetchJson", () => {
		beforeEach(() => {
			AssetBundle.baseUrl = "https://blob.example.com";
		});

		it("fetches and parses JSON from resolved url", async () => {
			const payload = { words: [{ start: 0, end: 1, text: "hello" }] };
			vi.stubGlobal(
				"fetch",
				vi.fn().mockResolvedValue({
					ok: true,
					status: 200,
					statusText: "OK",
					json: () => Promise.resolve(payload),
				}),
			);

			const bundle = new AssetBundle(
				"https://blob.example.com/assets/tts/cartesia/abc",
				{
					result: { timestamps: "timestamps.json" },
				},
			);

			const result = await bundle.fetchJson("timestamps");
			expect(result).toEqual(payload);
			expect(fetch).toHaveBeenCalledWith(
				"https://blob.example.com/assets/tts/cartesia/abc/timestamps.json",
			);

			vi.unstubAllGlobals();
		});

		it("throws a descriptive error when the response is not ok", async () => {
			vi.stubGlobal(
				"fetch",
				vi.fn().mockResolvedValue({
					ok: false,
					status: 404,
					statusText: "Not Found",
				}),
			);

			const bundle = new AssetBundle(
				"https://blob.example.com/assets/tts/cartesia/abc",
				{
					result: { timestamps: "timestamps.json" },
				},
			);

			await expect(bundle.fetchJson("timestamps")).rejects.toThrow(
				/timestamps.*404.*Not Found/,
			);

			vi.unstubAllGlobals();
		});
	});

	describe("upload", () => {
		const putMock = vi.fn();

		beforeEach(() => {
			AssetBundle.baseUrl = "https://blob.example.com";
			putMock.mockReset().mockResolvedValue({ url: "https://blob/stored" });
			vi.doMock("@vercel/blob", () => ({
				put: (...args: unknown[]) => putMock(...args),
			}));
		});

		afterEach(() => {
			vi.restoreAllMocks();
		});

		it("uploads files and returns BundleResponse", async () => {
			const result = await AssetBundle.upload("image", "runware", [
				{
					key: "image",
					filename: "output.png",
					data: Buffer.from("fake-image"),
					contentType: "image/png",
				},
			]);

			expect(result.provider).toBe("runware");
			expect(result.result.image).toBe("output.png");
			expect(result.id).toBeTruthy();
			// 2 calls: one for the file, one for manifest.json
			expect(putMock).toHaveBeenCalledTimes(2);
		});

		it("re-hosts remote files by streaming them into our own blob", async () => {
			const body = new ReadableStream();
			vi.stubGlobal(
				"fetch",
				vi.fn().mockResolvedValue({ ok: true, body, status: 200 }),
			);

			const result = await AssetBundle.upload("video", "runware", [
				{
					key: "video",
					filename: "output.mp4",
					contentType: "video/mp4",
					url: "https://cdn.example.com/video.mp4",
				},
			]);

			expect(fetch).toHaveBeenCalledWith("https://cdn.example.com/video.mp4");
			expect(result.result.video).toBe("output.mp4");
			expect(putMock).toHaveBeenCalledWith(
				expect.stringMatching(/^assets\/video\/runware\/.+\/output\.mp4$/),
				body,
				expect.objectContaining({ contentType: "video/mp4", multipart: true }),
			);

			vi.unstubAllGlobals();
		});

		it("throws when a remote file's source url is already dead", async () => {
			vi.stubGlobal(
				"fetch",
				vi.fn().mockResolvedValue({
					ok: false,
					status: 404,
					statusText: "Not Found",
					body: null,
				}),
			);

			await expect(
				AssetBundle.upload("video", "runware", [
					{
						key: "video",
						filename: "output.mp4",
						contentType: "video/mp4",
						url: "https://cdn.example.com/gone.mp4",
					},
				]),
			).rejects.toThrow(/video.*404.*Not Found/);

			vi.unstubAllGlobals();
		});
	});
});
