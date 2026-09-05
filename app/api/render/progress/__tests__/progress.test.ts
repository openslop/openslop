import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetUser = vi.fn();
vi.mock("@/lib/api/auth", () => ({
	getUser: () => mockGetUser(),
}));

const mockGetRenderProgress = vi.fn();
vi.mock("@remotion/lambda/client", () => ({
	getRenderProgress: (...args: unknown[]) => mockGetRenderProgress(...args),
	speculateFunctionName: () => "remotion-render-fn",
}));

vi.mock("@/lib/api/logger", () => ({
	logger: { error: vi.fn(), warn: vi.fn() },
}));

const { POST } = await import("@/app/api/render/progress/route");

function makeRequest(body: unknown) {
	return new NextRequest(
		new URL("/api/render/progress", "http://localhost:3000"),
		{ method: "POST", body: JSON.stringify(body) },
	);
}

const validBody = {
	renderId: "render-1",
	bucketName: "remotionlambda-useast1-abc123",
};

describe("POST /api/render/progress", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockGetUser.mockResolvedValue({ id: "user-1" });
	});

	it("returns 401 when unauthenticated", async () => {
		mockGetUser.mockResolvedValue(null);

		const res = await POST(makeRequest(validBody));

		expect(res.status).toBe(401);
	});

	it("returns 400 for an invalid body", async () => {
		const res = await POST(makeRequest({ renderId: "render-1" }));

		expect(res.status).toBe(400);
	});

	it("rejects a bucket the renderer never minted", async () => {
		const res = await POST(
			makeRequest({ ...validBody, bucketName: "someone-elses-bucket" }),
		);

		expect(res.status).toBe(400);
		expect(mockGetRenderProgress).not.toHaveBeenCalled();
	});

	it("rejects a renderId that walks out of its key prefix", async () => {
		const res = await POST(
			makeRequest({ ...validBody, renderId: "../../secrets" }),
		);

		expect(res.status).toBe(400);
		expect(mockGetRenderProgress).not.toHaveBeenCalled();
	});

	it("reports the fatal error's message, skipping retried chunks", async () => {
		mockGetRenderProgress.mockResolvedValue({
			fatalErrorEncountered: true,
			errors: [
				{
					name: "Error",
					message: "chunk flaked",
					isFatal: true,
					willRetry: true,
				},
				{
					name: "Error",
					message: "lambda exploded",
					isFatal: true,
					willRetry: false,
				},
			],
		});

		const res = await POST(makeRequest(validBody));

		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({
			type: "error",
			message: "lambda exploded",
		});
	});

	it("maps the stitcher timeout to an actionable message", async () => {
		mockGetRenderProgress.mockResolvedValue({
			fatalErrorEncountered: true,
			errors: [
				{
					name: "TimeoutError",
					message: "The main function timed out. ▸ Visit the logs",
					isFatal: true,
					willRetry: false,
				},
			],
		});

		const res = await POST(makeRequest(validBody));

		expect(await res.json()).toEqual({
			type: "error",
			message:
				"The export took too long to finish. Try a lower resolution or a shorter video.",
		});
	});

	it("falls back to a generic message when no error details exist", async () => {
		mockGetRenderProgress.mockResolvedValue({
			fatalErrorEncountered: true,
			errors: [],
		});

		const res = await POST(makeRequest(validBody));

		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({
			type: "error",
			message: "Render failed",
		});
	});

	it("reports done with the output file and size", async () => {
		mockGetRenderProgress.mockResolvedValue({
			fatalErrorEncountered: false,
			done: true,
			outputFile: "https://bucket/video.mp4",
			outputSizeInBytes: 1234,
		});

		const res = await POST(makeRequest(validBody));

		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({
			type: "done",
			url: "https://bucket/video.mp4",
			size: 1234,
		});
	});

	it("returns 500 when done without an output file", async () => {
		mockGetRenderProgress.mockResolvedValue({
			fatalErrorEncountered: false,
			done: true,
			outputFile: null,
			outputSizeInBytes: null,
		});

		const res = await POST(makeRequest(validBody));

		expect(res.status).toBe(500);
		expect((await res.json()).error).toContain("output file");
	});

	it("reports in-flight progress otherwise", async () => {
		mockGetRenderProgress.mockResolvedValue({
			fatalErrorEncountered: false,
			done: false,
			overallProgress: 0.42,
		});

		const res = await POST(makeRequest(validBody));

		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ type: "progress", progress: 0.42 });
	});
});
