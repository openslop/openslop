import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockImageGenerate = vi.fn();
const mockVideoGenerate = vi.fn();
const mockVideoPoll = vi.fn();
const mockMusicGenerate = vi.fn();
const mockSFXGenerate = vi.fn();
const mockLLMGenerate = vi.fn();
const mockLLMStream = vi.fn();
const mockTTSGenerate = vi.fn();
const mockTTSSearch = vi.fn();

vi.mock("@/lib/api/providers", () => ({
	getImageProvider: () => ({ generate: mockImageGenerate }),
	getVideoProvider: () => ({
		generate: mockVideoGenerate,
		poll: mockVideoPoll,
	}),
	getMusicProvider: () => ({ generate: mockMusicGenerate }),
	getSFXProvider: () => ({ generate: mockSFXGenerate }),
	getLLMProvider: () => ({
		generate: mockLLMGenerate,
		stream: mockLLMStream,
	}),
	getTTSProvider: () => ({
		generate: mockTTSGenerate,
		search: mockTTSSearch,
	}),
}));

vi.mock("@/lib/api/logger", () => ({
	logger: { error: vi.fn(), warn: vi.fn() },
}));

const mockGetUser = vi.fn();
vi.mock("@/lib/api/auth", () => ({
	getUser: () => mockGetUser(),
}));

function makeRequest(
	url: string,
	body?: Record<string, unknown>,
	method = "POST",
) {
	return new NextRequest(new URL(url, "http://localhost:3000"), {
		method,
		...(body ? { body: JSON.stringify(body) } : {}),
	});
}

describe("API routes", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockGetUser.mockResolvedValue({ id: "user-1" });
	});

	describe("POST /api/v1/image", () => {
		it("returns image result on success", async () => {
			const { POST } = await import("@/app/api/v1/image/route");
			mockImageGenerate.mockResolvedValue({ id: "img-abc123" });

			const res = await POST(makeRequest("/api/v1/image", { prompt: "cat" }));
			const json = await res.json();

			expect(res.status).toBe(200);
			expect(json.id).toBe("img-abc123");
		});

		it("returns 401 when the user is not authenticated", async () => {
			mockGetUser.mockResolvedValue(null);
			const { POST } = await import("@/app/api/v1/image/route");

			const res = await POST(makeRequest("/api/v1/image", { prompt: "cat" }));
			expect(res.status).toBe(401);
			expect(mockImageGenerate).not.toHaveBeenCalled();
		});

		it("returns 400 when prompt missing", async () => {
			const { POST } = await import("@/app/api/v1/image/route");
			const res = await POST(makeRequest("/api/v1/image", {}));
			expect(res.status).toBe(400);
		});

		it("returns 400 for invalid model", async () => {
			const { POST } = await import("@/app/api/v1/image/route");
			const res = await POST(
				makeRequest("/api/v1/image", { prompt: "cat", model: "bad-model" }),
			);
			expect(res.status).toBe(400);
			expect((await res.json()).error).toContain("Invalid model");
		});

		it("returns 500 on provider error", async () => {
			const { POST } = await import("@/app/api/v1/image/route");
			mockImageGenerate.mockRejectedValue(new Error("fail"));

			const res = await POST(makeRequest("/api/v1/image", { prompt: "cat" }));
			expect(res.status).toBe(500);
		});

		it("accepts requests without referenceImages", async () => {
			const { POST } = await import("@/app/api/v1/image/route");
			mockImageGenerate.mockResolvedValue({ id: "img-no-ref" });

			const res = await POST(makeRequest("/api/v1/image", { prompt: "cat" }));
			expect(res.status).toBe(200);
		});

		it("returns 400 for non-array referenceImages", async () => {
			const { POST } = await import("@/app/api/v1/image/route");
			const res = await POST(
				makeRequest("/api/v1/image", {
					prompt: "cat",
					referenceImages: "not-an-array",
				}),
			);
			expect(res.status).toBe(400);
			expect((await res.json()).error).toContain("expected array");
		});

		it("returns 400 for invalid referenceImages entry", async () => {
			const { POST } = await import("@/app/api/v1/image/route");
			const res = await POST(
				makeRequest("/api/v1/image", {
					prompt: "cat",
					referenceImages: ["not-a-data-uri"],
				}),
			);
			expect(res.status).toBe(400);
			expect((await res.json()).error).toContain("data URI or an HTTP");
		});

		it("accepts valid referenceImages data URIs", async () => {
			const { POST } = await import("@/app/api/v1/image/route");
			mockImageGenerate.mockResolvedValue({ id: "img-ref-data" });

			const res = await POST(
				makeRequest("/api/v1/image", {
					prompt: "cat",
					referenceImages: ["data:image/png;base64,iVBORw0KGgo"],
				}),
			);
			expect(res.status).toBe(200);
		});

		it("accepts valid referenceImages URLs", async () => {
			const { POST } = await import("@/app/api/v1/image/route");
			mockImageGenerate.mockResolvedValue({ id: "img-ref-url" });

			const res = await POST(
				makeRequest("/api/v1/image", {
					prompt: "cat",
					referenceImages: ["https://example.com/image.png"],
				}),
			);
			expect(res.status).toBe(200);
		});
	});

	describe("POST /api/v1/video", () => {
		it("returns video result on success", async () => {
			const { POST } = await import("@/app/api/v1/video/route");
			mockVideoGenerate.mockResolvedValue({
				id: "vid-abc123",
				provider: "runware",
				result: {},
				metadata: { jobId: "task-1", durationSec: 5 },
			});

			const res = await POST(
				makeRequest("/api/v1/video", { prompt: "sunset" }),
			);
			expect(res.status).toBe(200);
			expect((await res.json()).id).toBe("vid-abc123");
		});

		it("accepts requests without referenceImages", async () => {
			const { POST } = await import("@/app/api/v1/video/route");
			mockVideoGenerate.mockResolvedValue({
				id: "vid-no-ref",
				provider: "runware",
				result: {},
			});

			const res = await POST(
				makeRequest("/api/v1/video", { prompt: "sunset" }),
			);
			expect(res.status).toBe(200);
		});

		it("returns 400 for non-array referenceImages", async () => {
			const { POST } = await import("@/app/api/v1/video/route");
			const res = await POST(
				makeRequest("/api/v1/video", {
					prompt: "test",
					referenceImages: "not-an-array",
				}),
			);
			expect(res.status).toBe(400);
			expect((await res.json()).error).toContain("expected array");
		});

		it("returns 400 for invalid referenceImages entry", async () => {
			const { POST } = await import("@/app/api/v1/video/route");
			const res = await POST(
				makeRequest("/api/v1/video", {
					prompt: "test",
					referenceImages: ["not-a-data-uri"],
				}),
			);
			expect(res.status).toBe(400);
			expect((await res.json()).error).toContain("data URI or an HTTP");
		});

		it("accepts valid referenceImages data URIs", async () => {
			const { POST } = await import("@/app/api/v1/video/route");
			mockVideoGenerate.mockResolvedValue({
				id: "j2",
				provider: "runware",
				result: {},
			});

			const res = await POST(
				makeRequest("/api/v1/video", {
					prompt: "animate",
					referenceImages: ["data:image/png;base64,iVBORw0KGgo"],
				}),
			);
			expect(res.status).toBe(200);
		});

		it("accepts valid referenceImages URLs", async () => {
			const { POST } = await import("@/app/api/v1/video/route");
			mockVideoGenerate.mockResolvedValue({
				id: "j3",
				provider: "runware",
				result: {},
			});

			const res = await POST(
				makeRequest("/api/v1/video", {
					prompt: "animate",
					referenceImages: ["https://example.com/image.png"],
				}),
			);
			expect(res.status).toBe(200);
		});

		it("returns 400 for missing prompt", async () => {
			const { POST } = await import("@/app/api/v1/video/route");
			const res = await POST(makeRequest("/api/v1/video", {}));
			expect(res.status).toBe(400);
		});

		it("coerces string duration/width/height into numbers", async () => {
			const { POST } = await import("@/app/api/v1/video/route");
			mockVideoGenerate.mockResolvedValue({
				id: "vid-coerce",
				provider: "runware",
				result: {},
			});

			const res = await POST(
				makeRequest("/api/v1/video", {
					prompt: "sunset",
					duration: "5",
					width: "1280",
					height: "720",
				}),
			);
			expect(res.status).toBe(200);
			expect(mockVideoGenerate).toHaveBeenCalledWith(
				expect.objectContaining({ duration: 5, width: 1280, height: 720 }),
			);
		});

		it("returns 400 for non-numeric duration string", async () => {
			const { POST } = await import("@/app/api/v1/video/route");
			const res = await POST(
				makeRequest("/api/v1/video", { prompt: "x", duration: "abc" }),
			);
			expect(res.status).toBe(400);
		});

		it("returns 500 on provider error", async () => {
			const { POST } = await import("@/app/api/v1/video/route");
			mockVideoGenerate.mockRejectedValue(new Error("fail"));

			const res = await POST(
				makeRequest("/api/v1/video", { prompt: "sunset" }),
			);
			expect(res.status).toBe(500);
		});
	});

	describe("GET /api/v1/video/[jobId]", () => {
		it("polls video job status", async () => {
			const { GET } = await import("@/app/api/v1/video/[jobId]/route");
			mockVideoPoll.mockResolvedValue({
				jobId: "j1",
				status: "completed",
				url: "https://v.mp4",
			});

			const req = makeRequest("/api/v1/video/j1", undefined, "GET");
			const res = await GET(req, { params: Promise.resolve({ jobId: "j1" }) });
			const json = await res.json();

			expect(res.status).toBe(200);
			expect(json.status).toBe("completed");
			expect(json.url).toBe("https://v.mp4");
		});

		it("returns 500 on poll error", async () => {
			const { GET } = await import("@/app/api/v1/video/[jobId]/route");
			mockVideoPoll.mockRejectedValue(new Error("not found"));

			const req = makeRequest("/api/v1/video/j1", undefined, "GET");
			const res = await GET(req, { params: Promise.resolve({ jobId: "j1" }) });
			expect(res.status).toBe(500);
		});
	});

	describe("POST /api/v1/music", () => {
		it("returns music result on success", async () => {
			const { POST } = await import("@/app/api/v1/music/route");
			mockMusicGenerate.mockResolvedValue({ id: "mus-abc123" });

			const res = await POST(makeRequest("/api/v1/music", { prompt: "jazz" }));
			const json = await res.json();
			expect(res.status).toBe(200);
			expect(json.id).toBe("mus-abc123");
		});

		it("returns 400 for missing prompt", async () => {
			const { POST } = await import("@/app/api/v1/music/route");
			const res = await POST(makeRequest("/api/v1/music", {}));
			expect(res.status).toBe(400);
		});
	});

	describe("POST /api/v1/sfx", () => {
		it("returns sfx result on success", async () => {
			const { POST } = await import("@/app/api/v1/sfx/route");
			mockSFXGenerate.mockResolvedValue({ id: "sfx-abc123" });

			const res = await POST(
				makeRequest("/api/v1/sfx", { prompt: "explosion" }),
			);
			const json = await res.json();
			expect(res.status).toBe(200);
			expect(json.id).toBe("sfx-abc123");
		});

		it("returns 400 for invalid model", async () => {
			const { POST } = await import("@/app/api/v1/sfx/route");
			const res = await POST(
				makeRequest("/api/v1/sfx", { prompt: "boom", model: "invalid" }),
			);
			expect(res.status).toBe(400);
		});
	});

	describe("POST /api/v1/llm", () => {
		it("returns generate result", async () => {
			const { POST } = await import("@/app/api/v1/llm/route");
			mockLLMGenerate.mockResolvedValue({
				text: "Hello",
				model: "claude-sonnet-4-5-20250929",
				usage: { inputTokens: 5, outputTokens: 3 },
			});

			const res = await POST(makeRequest("/api/v1/llm", { prompt: "hi" }));
			expect(res.status).toBe(200);
			expect((await res.json()).text).toBe("Hello");
		});

		it("returns SSE stream when stream=true", async () => {
			const { POST } = await import("@/app/api/v1/llm/route");
			mockLLMStream.mockReturnValue(
				(async function* () {
					yield { text: "Hi", done: false };
					yield { text: "", done: true };
				})(),
			);

			const res = await POST(
				makeRequest("/api/v1/llm", { prompt: "hi", stream: true }),
			);

			expect(res.headers.get("content-type")).toBe("text/event-stream");
			const text = await res.text();
			expect(text).toContain("data:");
			expect(text).toContain('"text":"Hi"');
		});

		it("returns 400 for missing prompt", async () => {
			const { POST } = await import("@/app/api/v1/llm/route");
			const res = await POST(makeRequest("/api/v1/llm", {}));
			expect(res.status).toBe(400);
		});
	});

	describe("POST /api/v1/tts", () => {
		it("generates tts with timestamps", async () => {
			const { POST } = await import("@/app/api/v1/tts/route");
			mockTTSGenerate.mockResolvedValue({ id: "tts-abc123" });

			const res = await POST(
				makeRequest("/api/v1/tts", { prompt: "hi", voiceId: "v1" }),
			);
			const json = await res.json();

			expect(res.status).toBe(200);
			expect(json.id).toBe("tts-abc123");
		});

		it("returns 400 when voiceId missing", async () => {
			const { POST } = await import("@/app/api/v1/tts/route");
			const res = await POST(makeRequest("/api/v1/tts", { prompt: "hello" }));
			expect(res.status).toBe(400);
			expect((await res.json()).error).toContain("voiceId");
		});

		it("returns 400 when prompt missing", async () => {
			const { POST } = await import("@/app/api/v1/tts/route");
			const res = await POST(makeRequest("/api/v1/tts", { voiceId: "v1" }));
			expect(res.status).toBe(400);
		});
	});

	describe("GET /api/v1/tts/voices", () => {
		it("returns voices list", async () => {
			const { GET } = await import("@/app/api/v1/tts/voices/route");
			mockTTSSearch.mockResolvedValue([
				{ id: "v1", name: "Voice 1", language: "en" },
			]);

			const req = makeRequest(
				"/api/v1/tts/voices?query=english",
				undefined,
				"GET",
			);
			const res = await GET(req);
			const json = await res.json();

			expect(res.status).toBe(200);
			expect(json.voices).toHaveLength(1);
			expect(json.voices[0].name).toBe("Voice 1");
		});

		it("returns 500 on error", async () => {
			const { GET } = await import("@/app/api/v1/tts/voices/route");
			mockTTSSearch.mockRejectedValue(new Error("api down"));

			const req = makeRequest("/api/v1/tts/voices", undefined, "GET");
			const res = await GET(req);
			expect(res.status).toBe(500);
		});
	});
});
