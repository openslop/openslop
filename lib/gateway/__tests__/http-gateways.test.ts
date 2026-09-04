import { describe, expect, it, vi, beforeEach } from "vitest";
import { HttpAssetGateway, HttpLLMGateway, HttpTTSGateway } from "../http";

const BASE = "https://api.test.com";

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

const HOSTED_IMAGE = { provider: "openslop", model: "Slop Image v1" } as const;
const BYOK_IMAGE = { provider: "runware", model: "Seedream 5 Lite" } as const;
const HOSTED_VIDEO = { provider: "openslop", model: "Slop Video v1" } as const;
const HOSTED_TTS = { provider: "openslop", model: "Slop TTS v1" } as const;
const BYOK_TTS = { provider: "cartesia", model: "Sonic 3.5" } as const;
const HOSTED_LLM = { provider: "openslop", model: "Slop LLM v1" } as const;
const BYOK_LLM = { provider: "anthropic", model: "Claude Sonnet 5" } as const;

describe("HTTP gateways", () => {
	let fetchMock: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		fetchMock = vi.fn();
		vi.stubGlobal("fetch", fetchMock);
	});

	describe("HttpAssetGateway", () => {
		// The model's provider is the whole choice of route family: same protocol,
		// and the prefix says whose key pays for the generation.
		it.each([
			[HOSTED_IMAGE, "/api/v1"],
			[BYOK_IMAGE, "/api/third-party"],
		] as const)("posts %o generations to %s", async (model, prefix) => {
			const submission = { jobId: "job-1", status: "pending" };
			fetchMock.mockResolvedValue(jsonResponse(submission));

			const gw = new HttpAssetGateway(model, "image", BASE);

			expect(await gw.generate({ prompt: "a cat" })).toEqual(submission);
			expect(fetchMock).toHaveBeenCalledWith(
				`${BASE}${prefix}/image`,
				expect.objectContaining({ method: "POST" }),
			);
		});

		it("polls the job it submitted", async () => {
			const poll = {
				jobId: "job-1",
				status: "completed",
				result: null,
				error: null,
			};
			fetchMock.mockResolvedValue(jsonResponse(poll));

			const gw = new HttpAssetGateway(HOSTED_VIDEO, "video", BASE);

			expect(await gw.poll("job-1")).toEqual(poll);
			expect(fetchMock).toHaveBeenCalledWith(
				`${BASE}/api/v1/video/job-1`,
				expect.objectContaining({ method: "GET" }),
			);
		});
	});

	describe("HttpTTSGateway", () => {
		it("searches voices with the query it was given", async () => {
			const voices = [{ id: "v1", name: "Alice", gender: "feminine" }];
			fetchMock.mockResolvedValue(jsonResponse({ voices }));

			const gw = new HttpTTSGateway(HOSTED_TTS, BASE);

			expect(await gw.searchVoices({ gender: "feminine", limit: 5 })).toEqual(
				voices,
			);
			const url = new URL(fetchMock.mock.calls[0][0] as string);
			expect(url.pathname).toBe("/api/v1/tts/voices");
			expect(url.searchParams.get("gender")).toBe("feminine");
			expect(url.searchParams.get("limit")).toBe("5");
			expect(url.searchParams.get("provider")).toBe("openslop");
			expect(url.searchParams.get("model")).toBe("Slop TTS v1");
		});

		it("proxies each preview through its own family, naming the model", async () => {
			fetchMock.mockResolvedValue(
				jsonResponse({
					voices: [
						{ id: "v1", name: "Alice", previewUrl: "https://vendor/a.mp3" },
						{ id: "v2", name: "Bob" },
					],
				}),
			);

			const [alice, bob] = await new HttpTTSGateway(
				BYOK_TTS,
				BASE,
			).searchVoices({});

			const preview = new URL(alice?.previewUrl ?? "", BASE);
			expect(preview.pathname).toBe("/api/third-party/tts/voices/preview");
			expect(preview.searchParams.get("url")).toBe("https://vendor/a.mp3");
			expect(preview.searchParams.get("provider")).toBe("cartesia");
			expect(preview.searchParams.get("model")).toBe("Sonic 3.5");
			expect(bob?.previewUrl).toBeUndefined();
		});

		// A voice search names its model like a generation does, so the route
		// knows whose key to read.
		it("names its model when the key is the user's own", async () => {
			fetchMock.mockResolvedValue(jsonResponse({ voices: [] }));

			await new HttpTTSGateway(BYOK_TTS, BASE).searchVoices({
				query: undefined,
			});

			const url = new URL(fetchMock.mock.calls[0][0] as string);
			expect(url.pathname).toBe("/api/third-party/tts/voices");
			expect(url.searchParams.get("provider")).toBe("cartesia");
			expect(url.searchParams.get("model")).toBe("Sonic 3.5");
			expect(url.searchParams.has("query")).toBe(false);
		});
	});

	describe("HttpLLMGateway", () => {
		it("posts a non-streaming generation", async () => {
			const response = { text: "Hello!", model: "claude-3" };
			fetchMock.mockResolvedValue(jsonResponse(response));

			const gw = new HttpLLMGateway(HOSTED_LLM, BASE);

			expect(await gw.generate({ prompt: "hi" })).toEqual(response);
			expect(fetchMock).toHaveBeenCalledWith(
				`${BASE}/api/v1/llm`,
				expect.objectContaining({ method: "POST" }),
			);
		});

		it("streams SSE chunks", async () => {
			const chunks = [
				{ text: "Hel", done: false },
				{ text: "lo!", done: true },
			];
			fetchMock.mockResolvedValue(sseResponse(chunks));

			const gw = new HttpLLMGateway(BYOK_LLM, BASE);
			const results: unknown[] = [];
			for await (const chunk of gw.stream({ prompt: "hi" })) {
				results.push(chunk);
			}

			expect(results).toEqual(chunks);
			expect(fetchMock.mock.calls[0][0]).toBe(`${BASE}/api/third-party/llm`);
			const body = JSON.parse(
				fetchMock.mock.calls[0][1].body as string,
			) as Record<string, unknown>;
			expect(body.stream).toBe(true);
		});

		it("throws when a stream response has no body", async () => {
			fetchMock.mockResolvedValue(
				new Response(null, { status: 200, headers: {} }),
			);

			const gw = new HttpLLMGateway(HOSTED_LLM, BASE);
			await expect(async () => {
				for await (const _ of gw.stream({ prompt: "hi" })) {
					// consume
				}
			}).rejects.toThrow("No response body");
		});
	});
});
