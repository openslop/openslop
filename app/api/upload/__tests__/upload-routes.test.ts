import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetUser = vi.fn();
vi.mock("@/lib/api/auth", () => ({
	getUser: () => mockGetUser(),
}));

const mockHandleUpload = vi.fn();
vi.mock("@vercel/blob/client", () => ({
	handleUpload: (...args: unknown[]) => mockHandleUpload(...args),
}));

const { POST } = await import("@/app/api/upload/image/route");
const { POST: POST_VIDEO } = await import("@/app/api/upload/video/route");
const { POST: POST_AUDIO } = await import("@/app/api/upload/audio/route");

const tokenRequest = (pathname: string) => ({
	type: "blob.generate-client-token",
	payload: { pathname, clientPayload: null, multipart: false },
});

function makeRequest(body: unknown, kind: string) {
	return new NextRequest(
		new URL(`/api/upload/${kind}`, "http://localhost:3000"),
		{ method: "POST", body: JSON.stringify(body) },
	);
}

async function tokenOptions() {
	const [{ onBeforeGenerateToken }] = mockHandleUpload.mock.calls[0];
	return onBeforeGenerateToken();
}

beforeEach(() => {
	mockGetUser.mockResolvedValue({ id: "user-1" });
	mockHandleUpload.mockResolvedValue({
		type: "blob.generate-client-token",
		clientToken: "token-1",
	});
});

describe("POST /api/upload/:kind", () => {
	it("returns 401 when unauthenticated", async () => {
		mockGetUser.mockResolvedValue(null);

		const res = await POST(
			makeRequest(tokenRequest("assets/upload/user/a1/photo.png"), "image"),
		);

		expect(res.status).toBe(401);
		expect(mockHandleUpload).not.toHaveBeenCalled();
	});

	it("hands back a client token for a path under the upload folder", async () => {
		const res = await POST(
			makeRequest(tokenRequest("assets/upload/user/a1/photo.png"), "image"),
		);

		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({
			type: "blob.generate-client-token",
			clientToken: "token-1",
		});
	});

	it.each([
		"assets/image/runware/a1/photo.png",
		"assets/upload/user/a1/../photo.png",
		"assets/upload/user/photo.png",
	])("returns 400 for the path %s", async (pathname) => {
		const res = await POST(makeRequest(tokenRequest(pathname), "image"));

		expect(res.status).toBe(400);
		expect(mockHandleUpload).not.toHaveBeenCalled();
	});

	it("returns 400 for a completion callback", async () => {
		const res = await POST(
			makeRequest({ type: "blob.upload-completed", payload: {} }, "image"),
		);

		expect(res.status).toBe(400);
	});

	it("limits an image token to images up to 10 MB", async () => {
		await POST(
			makeRequest(tokenRequest("assets/upload/user/a1/photo.png"), "image"),
		);

		expect(await tokenOptions()).toEqual({
			allowedContentTypes: [
				"image/jpeg",
				"image/png",
				"image/gif",
				"image/webp",
				"image/avif",
			],
			maximumSizeInBytes: 10 * 1024 * 1024,
			addRandomSuffix: false,
		});
	});

	it("limits a video token to videos up to 50 MB", async () => {
		await POST_VIDEO(
			makeRequest(tokenRequest("assets/upload/user/a1/clip.mp4"), "video"),
		);

		expect(await tokenOptions()).toEqual({
			allowedContentTypes: ["video/*"],
			maximumSizeInBytes: 50 * 1024 * 1024,
			addRandomSuffix: false,
		});
	});

	it("limits an audio token to audio up to 20 MB", async () => {
		await POST_AUDIO(
			makeRequest(tokenRequest("assets/upload/user/a1/song.mp3"), "audio"),
		);

		expect(await tokenOptions()).toEqual({
			allowedContentTypes: ["audio/*"],
			maximumSizeInBytes: 20 * 1024 * 1024,
			addRandomSuffix: false,
		});
	});
});
