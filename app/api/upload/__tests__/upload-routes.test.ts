import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetUser = vi.fn();
vi.mock("@/lib/api/auth", () => ({
	getUser: () => mockGetUser(),
}));

const { AssetBundle } = await import("@/lib/api/asset-bundle");
const { POST } = await import("@/app/api/upload/image/route");
const { POST: POST_VIDEO } = await import("@/app/api/upload/video/route");
const mockUpload = vi.spyOn(AssetBundle, "upload");

function makeRequest(kind: string, file?: File) {
	const formData = new FormData();
	if (file) formData.set("file", file);
	return new NextRequest(
		new URL(`/api/upload/${kind}`, "http://localhost:3000"),
		{ method: "POST", body: formData },
	);
}

function makeFile(name = "photo.png", type = "image/png", size = 1024): File {
	return new File([new Uint8Array(size)], name, { type });
}

beforeEach(() => {
	vi.clearAllMocks();
	mockGetUser.mockResolvedValue({ id: "user-1" });
	AssetBundle.baseUrl = "https://assets.test";
});

describe("POST /api/upload/image", () => {
	beforeEach(() => {
		mockUpload.mockResolvedValue({
			id: "bundle-1",
			type: "upload",
			provider: "user",
			result: { image: "photo.png" },
		});
	});

	it("returns 401 when unauthenticated", async () => {
		mockGetUser.mockResolvedValue(null);

		const res = await POST(makeRequest("image"));

		expect(res.status).toBe(401);
	});

	it("returns 400 when no file is provided", async () => {
		const res = await POST(makeRequest("image"));

		expect(res.status).toBe(400);
		expect(await res.json()).toEqual({ error: "No file provided" });
	});

	it("returns 400 for non-image files", async () => {
		const res = await POST(
			makeRequest("image", makeFile("doc.pdf", "application/pdf")),
		);

		expect(res.status).toBe(400);
		expect(await res.json()).toEqual({ error: "File is not an image" });
	});

	it("returns 400 for files over 10 MB", async () => {
		const res = await POST(
			makeRequest(
				"image",
				makeFile("big.png", "image/png", 10 * 1024 * 1024 + 1),
			),
		);

		expect(res.status).toBe(400);
		expect(await res.json()).toEqual({ error: "File is over 10 MB" });
	});

	it("uploads the image and returns its URL", async () => {
		const res = await POST(makeRequest("image", makeFile()));

		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({
			url: "https://assets.test/assets/upload/user/bundle-1/photo.png",
		});
		expect(mockUpload).toHaveBeenCalledWith("upload", "user", [
			expect.objectContaining({
				key: "image",
				filename: "photo.png",
				contentType: "image/png",
			}),
		]);
	});

	it("sanitizes unsafe filenames", async () => {
		const res = await POST(
			makeRequest("image", makeFile("../we ird$.png", "image/png")),
		);

		expect(res.status).toBe(200);
		expect(mockUpload).toHaveBeenCalledWith("upload", "user", [
			expect.objectContaining({ filename: "we_ird_.png" }),
		]);
	});
});

describe("POST /api/upload/video", () => {
	beforeEach(() => {
		mockUpload.mockResolvedValue({
			id: "bundle-2",
			type: "upload",
			provider: "user",
			result: { video: "clip.mp4" },
		});
	});

	it("returns 400 for an image", async () => {
		const res = await POST_VIDEO(makeRequest("video", makeFile()));

		expect(res.status).toBe(400);
		expect(await res.json()).toEqual({ error: "File is not a video" });
	});

	it("returns 400 for files over 50 MB", async () => {
		const res = await POST_VIDEO(
			makeRequest(
				"video",
				makeFile("big.mp4", "video/mp4", 50 * 1024 * 1024 + 1),
			),
		);

		expect(res.status).toBe(400);
		expect(await res.json()).toEqual({ error: "File is over 50 MB" });
	});

	it("uploads the video and returns its URL", async () => {
		const res = await POST_VIDEO(
			makeRequest("video", makeFile("clip.mp4", "video/mp4")),
		);

		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({
			url: "https://assets.test/assets/upload/user/bundle-2/clip.mp4",
		});
		expect(mockUpload).toHaveBeenCalledWith("upload", "user", [
			expect.objectContaining({
				key: "video",
				filename: "clip.mp4",
				contentType: "video/mp4",
			}),
		]);
	});
});
