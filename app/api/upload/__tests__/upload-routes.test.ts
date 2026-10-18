import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetUser = vi.fn();
vi.mock("@/lib/api/auth", () => ({
	getUser: () => mockGetUser(),
}));

const { AssetBundle } = await import("@/lib/api/asset-bundle");
const { POST } = await import("@/app/api/upload/image/route");
const { POST: POST_VIDEO } = await import("@/app/api/upload/video/route");
const { POST: POST_AUDIO } = await import("@/app/api/upload/audio/route");
const mockUpload = vi.spyOn(AssetBundle, "upload");

function makeRequest(formData: FormData, kind: string) {
	return new NextRequest(
		new URL(`/api/upload/${kind}`, "http://localhost:3000"),
		{
			method: "POST",
			body: formData,
		},
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

		const res = await POST(makeRequest(new FormData(), "image"));

		expect(res.status).toBe(401);
	});

	it("returns 400 when no file is provided", async () => {
		const res = await POST(makeRequest(new FormData(), "image"));

		expect(res.status).toBe(400);
		expect(await res.json()).toEqual({ error: "No file provided" });
	});

	it("returns 400 for non-image files", async () => {
		const formData = new FormData();
		formData.set("file", makeFile("doc.pdf", "application/pdf"));

		const res = await POST(makeRequest(formData, "image"));

		expect(res.status).toBe(400);
		expect(await res.json()).toEqual({ error: "File is not an image" });
	});

	it("returns 400 for files over 10 MB", async () => {
		const formData = new FormData();
		formData.set(
			"file",
			makeFile("big.png", "image/png", 10 * 1024 * 1024 + 1),
		);

		const res = await POST(makeRequest(formData, "image"));

		expect(res.status).toBe(400);
		expect(await res.json()).toEqual({ error: "File is over 10 MB" });
	});

	it("uploads the image and returns its URL", async () => {
		const formData = new FormData();
		formData.set("file", makeFile());

		const res = await POST(makeRequest(formData, "image"));

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
		const formData = new FormData();
		formData.set("file", makeFile("../we ird$.png", "image/png"));

		const res = await POST(makeRequest(formData, "image"));

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

	const post = (file: File) => {
		const formData = new FormData();
		formData.set("file", file);
		return POST_VIDEO(makeRequest(formData, "video"));
	};

	it("returns 400 for an image", async () => {
		const res = await post(makeFile());

		expect(res.status).toBe(400);
		expect(await res.json()).toEqual({ error: "File is not a video" });
	});

	it("returns 400 for files over 50 MB", async () => {
		const res = await post(
			makeFile("big.mp4", "video/mp4", 50 * 1024 * 1024 + 1),
		);

		expect(res.status).toBe(400);
		expect(await res.json()).toEqual({ error: "File is over 50 MB" });
	});

	it("uploads the video and returns its URL", async () => {
		const res = await post(makeFile("clip.mp4", "video/mp4"));

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

describe("POST /api/upload/audio", () => {
	beforeEach(() => {
		mockUpload.mockResolvedValue({
			id: "bundle-3",
			type: "upload",
			provider: "user",
			result: { audio: "song.mp3" },
		});
	});

	const post = (file: File) => {
		const formData = new FormData();
		formData.set("file", file);
		return POST_AUDIO(makeRequest(formData, "audio"));
	};

	it("returns 400 for a video", async () => {
		const res = await post(makeFile("clip.mp4", "video/mp4"));

		expect(res.status).toBe(400);
		expect(await res.json()).toEqual({ error: "File is not audio" });
	});

	it("returns 400 for files over 20 MB", async () => {
		const res = await post(
			makeFile("big.mp3", "audio/mpeg", 20 * 1024 * 1024 + 1),
		);

		expect(res.status).toBe(400);
		expect(await res.json()).toEqual({ error: "File is over 20 MB" });
	});

	it("uploads the audio and returns its URL", async () => {
		const res = await post(makeFile("song.mp3", "audio/mpeg"));

		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({
			url: "https://assets.test/assets/upload/user/bundle-3/song.mp3",
		});
		expect(mockUpload).toHaveBeenCalledWith("upload", "user", [
			expect.objectContaining({
				key: "audio",
				filename: "song.mp3",
				contentType: "audio/mpeg",
			}),
		]);
	});
});
