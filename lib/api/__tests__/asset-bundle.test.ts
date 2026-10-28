import { describe, expect, it, vi, beforeEach } from "vitest";
import { z } from "zod";
import { AssetBundle, EmptyRemoteFileError } from "../asset-bundle";
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
		const TimestampsSchema = z.array(
			z.object({ start: z.number(), end: z.number(), text: z.string() }),
		);
		const payload = [{ start: 0, end: 1, text: "hello" }];
		const bundle = new AssetBundle(
			"https://blob.example.com/assets/tts/cartesia/abc",
			{ result: { timestamps: "timestamps.json" } },
		);

		function stubFetch(response: Partial<Response>) {
			vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response));
		}

		it("fetches the resolved url and parses the body through the schema", async () => {
			stubFetch({ ok: true, json: () => Promise.resolve(payload) });

			const result = await bundle.fetchJson("timestamps", TimestampsSchema);
			expect(result).toEqual(payload);
			expect(fetch).toHaveBeenCalledWith(
				"https://blob.example.com/assets/tts/cartesia/abc/timestamps.json",
			);
		});

		it("rejects a body the schema does not accept", async () => {
			stubFetch({ ok: true, json: () => Promise.resolve({ words: payload }) });

			await expect(
				bundle.fetchJson("timestamps", TimestampsSchema),
			).rejects.toThrow(z.ZodError);
		});

		it("throws a descriptive error when the response is not ok", async () => {
			stubFetch({ ok: false, status: 404, statusText: "Not Found" });

			await expect(
				bundle.fetchJson("timestamps", TimestampsSchema),
			).rejects.toThrow(/timestamps.*404.*Not Found/);
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
			for (const [, , options] of putMock.mock.calls) {
				expect(options).toMatchObject({ allowOverwrite: false });
			}
		});

		it("stores a named bundle where its name says, overwriting a twin", async () => {
			await AssetBundle.upload(
				"preview",
				"voice",
				[
					{
						key: "audio",
						filename: "preview.mp3",
						data: Buffer.from("bytes"),
						contentType: "audio/mpeg",
					},
				],
				{ durationSec: 6 },
				{ id: "abc123" },
			);

			expect(putMock).toHaveBeenCalledWith(
				"assets/preview/voice/abc123/preview.mp3",
				expect.anything(),
				expect.objectContaining({ allowOverwrite: true }),
			);
			expect(putMock).toHaveBeenCalledWith(
				"assets/preview/voice/abc123/manifest.json",
				expect.stringContaining('"durationSec":6'),
				expect.objectContaining({ allowOverwrite: true }),
			);
		});

		const remoteVideo = {
			key: "video",
			filename: "output.mp4",
			contentType: "video/mp4",
			url: "https://cdn.example.com/video.mp4",
		};

		it("re-hosts remote files by streaming them into our own blob", async () => {
			vi.stubGlobal(
				"fetch",
				vi.fn().mockResolvedValue(new Response("fake-video")),
			);

			const result = await AssetBundle.upload("video", "runware", [
				remoteVideo,
			]);

			expect(fetch).toHaveBeenCalledWith("https://cdn.example.com/video.mp4");
			expect(result.result.video).toBe("output.mp4");
			expect(putMock).toHaveBeenCalledWith(
				expect.stringMatching(/^assets\/video\/runware\/.+\/output\.mp4$/),
				expect.any(ReadableStream),
				expect.objectContaining({ contentType: "video/mp4", multipart: true }),
			);
			const [[, body]] = putMock.mock.calls;
			await expect(new Response(body).text()).resolves.toBe("fake-video");
		});

		it("names the file and provider when a remote file comes back with no bytes", async () => {
			vi.stubGlobal(
				"fetch",
				vi
					.fn()
					.mockResolvedValue(
						new Response("", { headers: { "content-length": "0" } }),
					),
			);

			await expect(
				AssetBundle.upload("video", "runware", [remoteVideo]),
			).rejects.toThrow('Empty file for "video" from runware');
			expect(putMock).not.toHaveBeenCalled();
		});

		it("knows a remote file is empty even when its host sends no length", async () => {
			vi.stubGlobal(
				"fetch",
				vi
					.fn()
					.mockResolvedValue(
						new Response(new ReadableStream({ start: (c) => c.close() })),
					),
			);

			await expect(
				AssetBundle.upload("video", "runware", [remoteVideo]),
			).rejects.toBeInstanceOf(EmptyRemoteFileError);
			expect(putMock).not.toHaveBeenCalled();
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
				AssetBundle.upload("video", "runware", [remoteVideo]),
			).rejects.toThrow(/video.*404.*Not Found/);
		});
	});

	describe("load", () => {
		beforeEach(() => {
			AssetBundle.baseUrl = "https://blob.example.com";
		});

		it("reads a stored bundle back by name", async () => {
			vi.stubGlobal(
				"fetch",
				vi.fn().mockResolvedValue(
					new Response(
						JSON.stringify({
							result: { audio: "preview.mp3" },
							metadata: { durationSec: 6 },
						}),
						{ status: 200 },
					),
				),
			);

			const response = await AssetBundle.load("preview", "voice", "abc123");

			expect(fetch).toHaveBeenCalledWith(
				"https://blob.example.com/assets/preview/voice/abc123/manifest.json",
			);
			expect(response).toEqual({
				id: "abc123",
				type: "preview",
				provider: "voice",
				result: { audio: "preview.mp3" },
				metadata: { durationSec: 6 },
			});
		});

		it("finds nothing under a name never stored", async () => {
			vi.stubGlobal(
				"fetch",
				vi.fn().mockResolvedValue(new Response(null, { status: 404 })),
			);

			await expect(
				AssetBundle.load("preview", "voice", "missing"),
			).resolves.toBeNull();
		});

		it("fails loudly when the store itself misbehaves", async () => {
			vi.stubGlobal(
				"fetch",
				vi
					.fn()
					.mockResolvedValue(
						new Response(null, { status: 500, statusText: "Boom" }),
					),
			);

			await expect(
				AssetBundle.load("preview", "voice", "abc123"),
			).rejects.toThrow("500 Boom");
		});
	});
});
