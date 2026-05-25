import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mockGetRenderProgress = vi.fn();
const mockGetUser = vi.fn();

vi.mock("@remotion/lambda/client", () => ({
	getRenderProgress: (...args: unknown[]) => mockGetRenderProgress(...args),
	speculateFunctionName: vi.fn(() => "remotion-fn"),
}));

vi.mock("@/lib/api/auth", () => ({
	getUser: () => mockGetUser(),
}));

import { POST } from "../route";

const makeRequest = (body: unknown) =>
	new NextRequest(new URL("/api/render/progress", "http://localhost:3000"), {
		method: "POST",
		body: JSON.stringify(body),
	});

describe("POST /api/render/progress", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockGetUser.mockResolvedValue({ id: "user-1" });
	});

	it("returns unauthorized when user is not authenticated", async () => {
		mockGetUser.mockResolvedValue(null);

		const response = await POST(
			makeRequest({ renderId: "r1", bucketName: "b1" }),
		);

		expect(response.status).toBe(401);
		expect(mockGetRenderProgress).not.toHaveBeenCalled();
	});

	it("returns an explicit error when render is done but output metadata is missing", async () => {
		mockGetRenderProgress.mockResolvedValue({
			done: true,
			fatalErrorEncountered: false,
			outputFile: undefined,
			outputSizeInBytes: undefined,
		});

		const response = await POST(
			makeRequest({ renderId: "r1", bucketName: "b1" }),
		);

		expect(response.status).toBe(200);
		await expect(response.json()).resolves.toEqual({
			type: "error",
			message: "Render completed without output metadata",
		});
	});

	it("returns done payload when output metadata is present", async () => {
		mockGetRenderProgress.mockResolvedValue({
			done: true,
			fatalErrorEncountered: false,
			outputFile: "https://cdn.example.com/video.mp4",
			outputSizeInBytes: 2048,
		});

		const response = await POST(
			makeRequest({ renderId: "r1", bucketName: "b1" }),
		);

		expect(response.status).toBe(200);
		await expect(response.json()).resolves.toEqual({
			type: "done",
			url: "https://cdn.example.com/video.mp4",
			size: 2048,
		});
	});
});
