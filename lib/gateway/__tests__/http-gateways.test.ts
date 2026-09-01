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

describe("HTTP gateways", () => {
	let fetchMock: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		fetchMock = vi.fn();
		vi.stubGlobal("fetch", fetchMock);
	});

	describe("HttpAssetGateway", () => {
		// The provider is the whole choice of route family: same protocol, and
		// the prefix says whose key pays for the generation.
		it.each([
			["openslop", "/api/v1"],
			["runware", "/api/third-party"],
		] as const)("posts %s generations to %s", async (provider, prefix) => {
			const submission = { jobId: "job-1", status: "pending" };
			fetchMock.mockResolvedValue(jsonResponse(submission));

			const gw = new HttpAssetGateway(provider, "image", BASE);

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

			const gw = new HttpAssetGateway("openslop", "video", BASE);

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

			const gw = new HttpTTSGateway("openslop", BASE);

			expect(await gw.searchVoices({ gender: "feminine" })).toEqual(voices);
			const url = fetchMock.mock.calls[0][0] as string;
			expect(url).toContain("/api/v1/tts/voices");
			expect(url).toContain("gender=feminine");
			// The hosted route reads its own key, so naming a provider would be noise.
			expect(url).not.toContain("provider=");
		});

		// A voice search carries no model to resolve a provider from, so it says.
		it("names its provider when the key is the user's own", async () => {
			fetchMock.mockResolvedValue(jsonResponse({ voices: [] }));

			await new HttpTTSGateway("cartesia", BASE).searchVoices({});

			const url = fetchMock.mock.calls[0][0] as string;
			expect(url).toContain("/api/third-party/tts/voices");
			expect(url).toContain("provider=cartesia");
		});
	});

	describe("HttpLLMGateway", () => {
		it("posts a non-streaming generation", async () => {
			const response = { text: "Hello!", model: "claude-3" };
			fetchMock.mockResolvedValue(jsonResponse(response));

			const gw = new HttpLLMGateway("openslop", BASE);

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

			const gw = new HttpLLMGateway("anthropic", BASE);
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

			const gw = new HttpLLMGateway("openslop", BASE);
			await expect(async () => {
				for await (const _ of gw.stream({ prompt: "hi" })) {
					// consume
				}
			}).rejects.toThrow("No response body");
		});
	});
});
