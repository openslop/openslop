import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockLLMGenerate = vi.fn();
const mockLLMStream = vi.fn();
const mockTTSSearch = vi.fn();

const noopProvider = () => ({ generate: vi.fn(), poll: vi.fn() });
vi.mock("@/lib/api/providers", () => ({
	getLLMProvider: () => ({
		generate: mockLLMGenerate,
		stream: mockLLMStream,
	}),
	getTTSProvider: () => ({ search: mockTTSSearch, generate: vi.fn() }),
	getImageProvider: noopProvider,
	getMusicProvider: noopProvider,
	getSFXProvider: noopProvider,
	getVideoProvider: noopProvider,
}));

const mockCreateJob = vi.fn();
const mockEnqueueJob = vi.fn();
const mockGetJob = vi.fn();
vi.mock("@/lib/api/jobs", () => ({
	createJob: (...args: unknown[]) => mockCreateJob(...args),
	enqueueJob: (...args: unknown[]) => mockEnqueueJob(...args),
	getJob: (...args: unknown[]) => mockGetJob(...args),
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

type RoutePost = (req: NextRequest) => Promise<Response>;

// Every asset route that accepts `referenceImages` shares the same field
// contract (see optionalReferenceImages), so its validation coverage is
// identical. Register the suite once per route instead of duplicating it.
function referenceImagesSuite(
	routePath: string,
	loadPost: () => Promise<{ POST: RoutePost }>,
) {
	const post = (body: Record<string, unknown>) =>
		loadPost().then(({ POST }) =>
			POST(makeRequest(routePath, { prompt: "a", ...body })),
		);

	it("accepts requests without referenceImages", async () => {
		expect((await post({})).status).toBe(200);
	});

	it("returns 400 for non-array referenceImages", async () => {
		const res = await post({ referenceImages: "not-an-array" });
		expect(res.status).toBe(400);
		expect((await res.json()).error).toContain("expected array");
	});

	it("returns 400 for invalid referenceImages entry", async () => {
		const res = await post({ referenceImages: ["not-a-data-uri"] });
		expect(res.status).toBe(400);
		expect((await res.json()).error).toContain("data URI or an HTTP");
	});

	it("accepts valid referenceImages data URIs", async () => {
		const res = await post({
			referenceImages: ["data:image/png;base64,iVBORw0KGgo"],
		});
		expect(res.status).toBe(200);
	});

	it("accepts valid referenceImages URLs", async () => {
		const res = await post({
			referenceImages: ["https://example.com/image.png"],
		});
		expect(res.status).toBe(200);
	});
}

const JOB_ID = "00000000-0000-0000-0000-000000000001";

describe("API routes", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockGetUser.mockResolvedValue({
			id: "user-1",
			app_metadata: { api_access: true },
		});
		mockCreateJob.mockResolvedValue({ id: "job-abc" });
		mockEnqueueJob.mockResolvedValue(undefined);
	});

	describe("POST /api/v1/image", () => {
		it("enqueues a job and returns jobId", async () => {
			const { POST } = await import("@/app/api/v1/image/route");
			const res = await POST(makeRequest("/api/v1/image", { prompt: "cat" }));
			const json = await res.json();

			expect(res.status).toBe(200);
			expect(json).toEqual({ jobId: "job-abc", status: "pending" });
			expect(mockCreateJob).toHaveBeenCalledWith({
				userId: "user-1",
				projectId: undefined,
				connectorType: "image",
				request: expect.objectContaining({ prompt: "cat" }),
			});
			expect(mockEnqueueJob).toHaveBeenCalledWith("job-abc", "image");
		});

		it("persists projectId and strips it from the provider request", async () => {
			const { POST } = await import("@/app/api/v1/image/route");
			const pid = "00000000-0000-4000-8000-000000000000";
			const res = await POST(
				makeRequest("/api/v1/image", { prompt: "cat", projectId: pid }),
			);
			expect(res.status).toBe(200);
			const [[args]] = mockCreateJob.mock.calls;
			expect(args.projectId).toBe(pid);
			expect(args.request).not.toHaveProperty("projectId");
		});

		it("returns 400 for invalid projectId", async () => {
			const { POST } = await import("@/app/api/v1/image/route");
			const res = await POST(
				makeRequest("/api/v1/image", {
					prompt: "cat",
					projectId: "not-a-uuid",
				}),
			);
			expect(res.status).toBe(400);
		});

		it("returns 401 when the user is not authenticated", async () => {
			mockGetUser.mockResolvedValue(null);
			const { POST } = await import("@/app/api/v1/image/route");

			const res = await POST(makeRequest("/api/v1/image", { prompt: "cat" }));
			expect(res.status).toBe(401);
			expect(mockCreateJob).not.toHaveBeenCalled();
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

		it("returns 500 when createJob fails", async () => {
			mockCreateJob.mockRejectedValue(new Error("db down"));
			const { POST } = await import("@/app/api/v1/image/route");
			const res = await POST(makeRequest("/api/v1/image", { prompt: "cat" }));
			expect(res.status).toBe(500);
		});

		referenceImagesSuite(
			"/api/v1/image",
			() => import("@/app/api/v1/image/route"),
		);

		it("returns 400 for blank dimension strings", async () => {
			const { POST } = await import("@/app/api/v1/image/route");
			const res = await POST(
				makeRequest("/api/v1/image", { prompt: "cat", width: "   " }),
			);

			expect(res.status).toBe(400);
			expect((await res.json()).error).toContain("must be a finite number");
			expect(mockCreateJob).not.toHaveBeenCalled();
		});
	});

	describe("POST /api/v1/video", () => {
		it("enqueues a video job", async () => {
			const { POST } = await import("@/app/api/v1/video/route");
			const res = await POST(
				makeRequest("/api/v1/video", { prompt: "sunset" }),
			);
			expect(res.status).toBe(200);
			expect((await res.json()).jobId).toBe("job-abc");
			expect(mockEnqueueJob).toHaveBeenCalledWith("job-abc", "video");
		});

		referenceImagesSuite(
			"/api/v1/video",
			() => import("@/app/api/v1/video/route"),
		);

		it("returns 400 for missing prompt", async () => {
			const { POST } = await import("@/app/api/v1/video/route");
			const res = await POST(makeRequest("/api/v1/video", {}));
			expect(res.status).toBe(400);
		});

		it("coerces string duration/width/height into numbers", async () => {
			const { POST } = await import("@/app/api/v1/video/route");
			const res = await POST(
				makeRequest("/api/v1/video", {
					prompt: "sunset",
					duration: "5",
					width: "1280",
					height: "720",
				}),
			);
			expect(res.status).toBe(200);
			expect(mockCreateJob).toHaveBeenCalledWith(
				expect.objectContaining({
					request: expect.objectContaining({
						duration: 5,
						width: 1280,
						height: 720,
					}),
				}),
			);
		});

		it("returns 400 for non-numeric duration string", async () => {
			const { POST } = await import("@/app/api/v1/video/route");
			const res = await POST(
				makeRequest("/api/v1/video", { prompt: "x", duration: "abc" }),
			);
			expect(res.status).toBe(400);
		});

		it("returns 400 for blank duration strings", async () => {
			const { POST } = await import("@/app/api/v1/video/route");
			const res = await POST(
				makeRequest("/api/v1/video", { prompt: "x", duration: "" }),
			);

			expect(res.status).toBe(400);
			expect((await res.json()).error).toContain("must be a finite number");
			expect(mockCreateJob).not.toHaveBeenCalled();
		});

		it("returns 500 when createJob fails", async () => {
			mockCreateJob.mockRejectedValue(new Error("db down"));
			const { POST } = await import("@/app/api/v1/video/route");
			const res = await POST(
				makeRequest("/api/v1/video", { prompt: "sunset" }),
			);
			expect(res.status).toBe(500);
		});
	});

	describe("GET /api/v1/video/[jobId]", () => {
		it("returns job status", async () => {
			const { GET } = await import("@/app/api/v1/video/[jobId]/route");
			mockGetJob.mockResolvedValue({
				id: JOB_ID,
				status: "completed",
				result: { id: "x", provider: "p", result: { video: "v.mp4" } },
				error: null,
			});

			const req = makeRequest(`/api/v1/video/${JOB_ID}`, undefined, "GET");
			const res = await GET(req, {
				params: Promise.resolve({ jobId: JOB_ID }),
			});
			const json = await res.json();

			expect(res.status).toBe(200);
			expect(json.status).toBe("completed");
			expect(json.result.result.video).toBe("v.mp4");
		});

		it("returns 404 when job is missing", async () => {
			const { GET } = await import("@/app/api/v1/video/[jobId]/route");
			mockGetJob.mockResolvedValue(null);

			const req = makeRequest(`/api/v1/video/${JOB_ID}`, undefined, "GET");
			const res = await GET(req, {
				params: Promise.resolve({ jobId: JOB_ID }),
			});
			expect(res.status).toBe(404);
		});

		it("returns 500 on lookup error", async () => {
			const { GET } = await import("@/app/api/v1/video/[jobId]/route");
			mockGetJob.mockRejectedValue(new Error("db error"));

			const req = makeRequest(`/api/v1/video/${JOB_ID}`, undefined, "GET");
			const res = await GET(req, {
				params: Promise.resolve({ jobId: JOB_ID }),
			});
			expect(res.status).toBe(500);
		});
	});

	describe("POST /api/v1/music", () => {
		it("enqueues a music job", async () => {
			const { POST } = await import("@/app/api/v1/music/route");
			const res = await POST(makeRequest("/api/v1/music", { prompt: "jazz" }));
			const json = await res.json();
			expect(res.status).toBe(200);
			expect(json.jobId).toBe("job-abc");
			expect(mockEnqueueJob).toHaveBeenCalledWith("job-abc", "music");
		});

		it("returns 400 for missing prompt", async () => {
			const { POST } = await import("@/app/api/v1/music/route");
			const res = await POST(makeRequest("/api/v1/music", {}));
			expect(res.status).toBe(400);
		});
	});

	describe("POST /api/v1/sfx", () => {
		it("enqueues a sfx job", async () => {
			const { POST } = await import("@/app/api/v1/sfx/route");
			const res = await POST(
				makeRequest("/api/v1/sfx", { prompt: "explosion" }),
			);
			const json = await res.json();
			expect(res.status).toBe(200);
			expect(json.jobId).toBe("job-abc");
			expect(mockEnqueueJob).toHaveBeenCalledWith("job-abc", "sfx");
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

		// The name survives the boundary; this route is where it becomes the id
		// Anthropic's own API takes.
		it("forwards the vendor's id for the model it was asked for", async () => {
			const { POST } = await import("@/app/api/v1/llm/route");
			mockLLMGenerate.mockResolvedValue({ text: "Hello", model: "x" });

			await POST(
				makeRequest("/api/v1/llm", { prompt: "hi", model: "Slop LLM v1" }),
			);

			expect(mockLLMGenerate).toHaveBeenCalledWith(
				expect.objectContaining({ model: "claude-opus-5" }),
			);
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
		it("enqueues a tts job", async () => {
			const { POST } = await import("@/app/api/v1/tts/route");
			const res = await POST(
				makeRequest("/api/v1/tts", { prompt: "hi", voiceId: "v1" }),
			);
			const json = await res.json();
			expect(res.status).toBe(200);
			expect(json.jobId).toBe("job-abc");
			expect(mockEnqueueJob).toHaveBeenCalledWith("job-abc", "tts");
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
