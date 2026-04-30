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
					version: 1,
					type: "image",
					createdAt: "",
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
					version: 1,
					type: "video",
					createdAt: "",
					result: { video: "https://cdn.example.com/video.mp4" },
				},
			);
			expect(bundle.resolve("video")).toBe("https://cdn.example.com/video.mp4");
		});

		it("throws for unknown key", () => {
			const bundle = new AssetBundle("https://blob.example.com/x", {
				version: 1,
				type: "image",
				createdAt: "",
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
				provider: "runware",
				result: { image: "output.png" },
			};
			const bundle = AssetBundle.fromResponse("image", response);
			expect(bundle.resolve("image")).toBe(
				"https://blob.example.com/assets/image/runware/abc/output.png",
			);
			expect(bundle.manifest.type).toBe("image");
			expect(bundle.manifest.version).toBe(1);
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
					version: 1,
					type: "tts",
					createdAt: "",
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

		it("throws when response is not ok", async () => {
			vi.stubGlobal(
				"fetch",
				vi.fn().mockResolvedValue({
					ok: false,
					status: 404,
					statusText: "Not Found",
					json: () => Promise.resolve({}),
				}),
			);

			const bundle = new AssetBundle(
				"https://blob.example.com/assets/tts/cartesia/abc",
				{
					version: 1,
					type: "tts",
					createdAt: "",
					result: { timestamps: "timestamps.json" },
				},
			);

			await expect(bundle.fetchJson("timestamps")).rejects.toThrow(
				/timestamps.*404/,
			);
			vi.unstubAllGlobals();
		});
	});

	describe("fromId", () => {
		beforeEach(() => {
			AssetBundle.baseUrl = "https://blob.example.com";
		});

		it("fetches manifest and creates bundle", async () => {
			const manifest = {
				version: 1,
				type: "image",
				createdAt: "2024-01-01",
				result: { image: "output.png" },
			};
			vi.stubGlobal(
				"fetch",
				vi.fn().mockResolvedValue({
					ok: true,
					status: 200,
					statusText: "OK",
					json: () => Promise.resolve(manifest),
				}),
			);

			const bundle = await AssetBundle.fromId("image", "runware", "abc");
			expect(bundle.manifest).toEqual(manifest);
			expect(bundle.resolve("image")).toBe(
				"https://blob.example.com/assets/image/runware/abc/output.png",
			);
			expect(fetch).toHaveBeenCalledWith(
				"https://blob.example.com/assets/image/runware/abc/manifest.json",
			);

			vi.unstubAllGlobals();
		});

		it("throws when manifest response is not ok", async () => {
			vi.stubGlobal(
				"fetch",
				vi.fn().mockResolvedValue({
					ok: false,
					status: 500,
					statusText: "Internal Server Error",
					json: () => Promise.resolve({}),
				}),
			);

			await expect(
				AssetBundle.fromId("image", "runware", "abc"),
			).rejects.toThrow(/image\/runware\/abc.*500/);
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

		it("stores external urls directly in result without uploading", async () => {
			const result = await AssetBundle.upload("video", "runware", [
				{ key: "video", url: "https://cdn.example.com/video.mp4" },
			]);

			expect(result.result.video).toBe("https://cdn.example.com/video.mp4");
			// Only manifest upload, no file upload for external urls
			expect(putMock).toHaveBeenCalledTimes(1);
		});
	});
});
