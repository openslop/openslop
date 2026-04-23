import { describe, expect, it, vi, beforeEach } from "vitest";
import { OpenSlopImageGateway } from "../openslop/image";
import { OpenSlopMusicGateway } from "../openslop/music";
import { OpenSlopSFXGateway } from "../openslop/sfx";
import { OpenSlopTTSGateway } from "../openslop/tts";
import { OpenSlopVideoGateway } from "../openslop/video";
import { OpenSlopLLMGateway } from "../openslop/llm";

function jsonResponse(data: unknown) {
	return new Response(JSON.stringify(data), {
		status: 200,
		headers: { "content-type": "application/json" },
	});
}

function sseResponse(events: unknown[]) {
	const body = events.map((e) => `data: ${JSON.stringify(e)}\n\n`).join("");
	return new Response(body, {
		status: 200,
		headers: { "content-type": "text/event-stream" },
	});
}

describe("OpenSlop Gateway Clients", () => {
	let fetchMock: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		fetchMock = vi.fn();
		vi.stubGlobal("fetch", fetchMock);
	});

	describe("OpenSlopImageGateway", () => {
		it("posts to /api/v1/image with params", async () => {
			const response = {
				id: "img-1",
				provider: "openslop",
				result: { image: "output.png" },
			};
			fetchMock.mockResolvedValue(jsonResponse(response));

			const gw = new OpenSlopImageGateway("https://api.test.com");
			const result = await gw.generate({ prompt: "a cat", model: "v1" });

			expect(result).toEqual(response);
			expect(fetchMock).toHaveBeenCalledWith(
				"https://api.test.com/api/v1/image",
				expect.objectContaining({ method: "POST" }),
			);
		});
	});

	describe("OpenSlopMusicGateway", () => {
		it("posts to /api/v1/music with params", async () => {
			const response = {
				id: "mus-1",
				provider: "openslop",
				result: { music: "output.mp3" },
			};
			fetchMock.mockResolvedValue(jsonResponse(response));

			const gw = new OpenSlopMusicGateway("https://api.test.com");
			const result = await gw.generate({
				prompt: "jazz",
				durationSeconds: 30,
			});

			expect(result).toEqual(response);
			expect(fetchMock).toHaveBeenCalledWith(
				"https://api.test.com/api/v1/music",
				expect.objectContaining({ method: "POST" }),
			);
		});
	});

	describe("OpenSlopSFXGateway", () => {
		it("posts to /api/v1/sfx with params", async () => {
			const response = {
				id: "sfx-1",
				provider: "openslop",
				result: { sfx: "boom.mp3" },
			};
			fetchMock.mockResolvedValue(jsonResponse(response));

			const gw = new OpenSlopSFXGateway("https://api.test.com");
			const result = await gw.generate({ prompt: "explosion" });

			expect(result).toEqual(response);
			expect(fetchMock).toHaveBeenCalledWith(
				"https://api.test.com/api/v1/sfx",
				expect.objectContaining({ method: "POST" }),
			);
		});
	});

	describe("OpenSlopTTSGateway", () => {
		it("posts to /api/v1/tts with params", async () => {
			const response = {
				id: "tts-1",
				provider: "openslop",
				result: { tts: "speech.mp3" },
			};
			fetchMock.mockResolvedValue(jsonResponse(response));

			const gw = new OpenSlopTTSGateway("https://api.test.com");
			const result = await gw.generate({
				prompt: "hello world",
				voiceId: "v1",
			});

			expect(result).toEqual(response);
			expect(fetchMock).toHaveBeenCalledWith(
				"https://api.test.com/api/v1/tts",
				expect.objectContaining({ method: "POST" }),
			);
		});

		it("searches voices with query params", async () => {
			const voices = [
				{ id: "v1", name: "Alice", gender: "female" },
				{ id: "v2", name: "Bob", gender: "male" },
			];
			fetchMock.mockResolvedValue(jsonResponse({ voices }));

			const gw = new OpenSlopTTSGateway("https://api.test.com");
			const result = await gw.searchVoices({ gender: "female" });

			expect(result).toEqual(voices);
			const url = fetchMock.mock.calls[0][0] as string;
			expect(url).toContain("/api/v1/tts/voices");
			expect(url).toContain("gender=female");
		});

		it("searches voices with empty params", async () => {
			fetchMock.mockResolvedValue(jsonResponse({ voices: [] }));

			const gw = new OpenSlopTTSGateway("https://api.test.com");
			const result = await gw.searchVoices({});

			expect(result).toEqual([]);
		});
	});

	describe("OpenSlopVideoGateway", () => {
		it("posts to /api/v1/video with params", async () => {
			const response = {
				id: "vid-1",
				provider: "openslop",
				result: {},
				metadata: { jobId: "job-1" },
			};
			fetchMock.mockResolvedValue(jsonResponse(response));

			const gw = new OpenSlopVideoGateway("https://api.test.com");
			const result = await gw.generate({ prompt: "a sunset" });

			expect(result).toEqual(response);
			expect(fetchMock).toHaveBeenCalledWith(
				"https://api.test.com/api/v1/video",
				expect.objectContaining({ method: "POST" }),
			);
		});

		it("polls job status via GET", async () => {
			const response = {
				id: "vid-1",
				provider: "openslop",
				result: { video: "output.mp4" },
				metadata: { jobId: "job-1", status: "completed" },
			};
			fetchMock.mockResolvedValue(jsonResponse(response));

			const gw = new OpenSlopVideoGateway("https://api.test.com");
			const result = await gw.poll("job-1");

			expect(result).toEqual(response);
			expect(fetchMock).toHaveBeenCalledWith(
				"https://api.test.com/api/v1/video/job-1",
				expect.objectContaining({ method: "GET" }),
			);
		});
	});

	describe("OpenSlopLLMGateway", () => {
		it("posts to /api/v1/llm for non-streaming generate", async () => {
			const response = { text: "Hello!", model: "claude-3" };
			fetchMock.mockResolvedValue(jsonResponse(response));

			const gw = new OpenSlopLLMGateway("https://api.test.com");
			const result = await gw.generate({ prompt: "hi" });

			expect(result).toEqual(response);
			expect(fetchMock).toHaveBeenCalledWith(
				"https://api.test.com/api/v1/llm",
				expect.objectContaining({ method: "POST" }),
			);
		});

		it("streams SSE chunks from /api/v1/llm", async () => {
			const chunks = [
				{ text: "Hel", done: false },
				{ text: "lo!", done: true },
			];
			fetchMock.mockResolvedValue(sseResponse(chunks));

			const gw = new OpenSlopLLMGateway("https://api.test.com");
			const results: unknown[] = [];
			for await (const chunk of gw.stream({ prompt: "hi" })) {
				results.push(chunk);
			}

			expect(results).toEqual(chunks);
			const body = JSON.parse(
				fetchMock.mock.calls[0][1].body as string,
			) as Record<string, unknown>;
			expect(body.stream).toBe(true);
		});

		it("throws when stream response has no body", async () => {
			fetchMock.mockResolvedValue(
				new Response(null, { status: 200, headers: {} }),
			);

			const gw = new OpenSlopLLMGateway("https://api.test.com");
			await expect(async () => {
				for await (const _ of gw.stream({ prompt: "hi" })) {
					// consume
				}
			}).rejects.toThrow("No response body");
		});
	});
});
