import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetRenderProgress = vi.fn();
vi.mock("@remotion/lambda/client", () => ({
	getRenderProgress: (...args: unknown[]) => mockGetRenderProgress(...args),
	speculateFunctionName: () => "remotion-fn",
}));

vi.mock("@/lib/api/auth", () => ({
	getUser: () => Promise.resolve({ id: "user-1" }),
}));

vi.mock("@/lib/api/logger", () => ({
	logger: { warn: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

import { POST } from "../route";

function makeRequest(body: unknown, raw?: string) {
	return new NextRequest("http://localhost/api/render/progress", {
		method: "POST",
		body: raw ?? JSON.stringify(body),
		headers: { "Content-Type": "application/json" },
	});
}

beforeEach(() => {
	mockGetRenderProgress.mockReset();
});

describe("POST /api/render/progress", () => {
	it("returns progress while rendering", async () => {
		mockGetRenderProgress.mockResolvedValue({
			done: false,
			fatalErrorEncountered: false,
			overallProgress: 0.42,
			errors: [],
		});
		const res = await POST(makeRequest({ renderId: "r1", bucketName: "b1" }));
		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ type: "progress", progress: 0.42 });
	});

	it("returns done payload when output is present", async () => {
		mockGetRenderProgress.mockResolvedValue({
			done: true,
			fatalErrorEncountered: false,
			overallProgress: 1,
			outputFile: "https://s3/output.mp4",
			outputSizeInBytes: 12345,
			errors: [],
		});
		const res = await POST(makeRequest({ renderId: "r1", bucketName: "b1" }));
		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({
			type: "done",
			url: "https://s3/output.mp4",
			size: 12345,
		});
	});

	it("returns 500 when done but outputFile is missing", async () => {
		mockGetRenderProgress.mockResolvedValue({
			done: true,
			fatalErrorEncountered: false,
			overallProgress: 1,
			outputFile: null,
			outputSizeInBytes: null,
			errors: [],
		});
		const res = await POST(makeRequest({ renderId: "r1", bucketName: "b1" }));
		expect(res.status).toBe(500);
		expect((await res.json()).error).toMatch(/output file/i);
	});

	it("returns 500 when done but size is missing (zero-byte vs null)", async () => {
		mockGetRenderProgress.mockResolvedValue({
			done: true,
			fatalErrorEncountered: false,
			overallProgress: 1,
			outputFile: "https://s3/output.mp4",
			outputSizeInBytes: null,
			errors: [],
		});
		const res = await POST(makeRequest({ renderId: "r1", bucketName: "b1" }));
		expect(res.status).toBe(500);
	});

	it("accepts a zero-byte size as valid (not coerced to missing)", async () => {
		mockGetRenderProgress.mockResolvedValue({
			done: true,
			fatalErrorEncountered: false,
			overallProgress: 1,
			outputFile: "https://s3/empty.mp4",
			outputSizeInBytes: 0,
			errors: [],
		});
		const res = await POST(makeRequest({ renderId: "r1", bucketName: "b1" }));
		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({
			type: "done",
			url: "https://s3/empty.mp4",
			size: 0,
		});
	});

	it("reports fatal errors with the first error message", async () => {
		mockGetRenderProgress.mockResolvedValue({
			done: false,
			fatalErrorEncountered: true,
			overallProgress: 0,
			errors: [{ message: "boom" }],
		});
		const res = await POST(makeRequest({ renderId: "r1", bucketName: "b1" }));
		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ type: "error", message: "boom" });
	});

	it("falls back to a generic message when fatal but no errors array entry", async () => {
		mockGetRenderProgress.mockResolvedValue({
			done: false,
			fatalErrorEncountered: true,
			overallProgress: 0,
			errors: [],
		});
		const res = await POST(makeRequest({ renderId: "r1", bucketName: "b1" }));
		expect((await res.json()).message).toBe("Render failed");
	});

	it("returns 400 on malformed JSON", async () => {
		const res = await POST(makeRequest(undefined, "{not json"));
		expect(res.status).toBe(400);
	});

	it("returns 400 when required fields are missing", async () => {
		const res = await POST(makeRequest({ renderId: "r1" }));
		expect(res.status).toBe(400);
	});
});
