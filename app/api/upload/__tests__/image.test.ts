import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetUser = vi.fn();
vi.mock("@/lib/api/auth", () => ({
	getUser: () => mockGetUser(),
}));

const { AssetBundle } = await import("@/lib/api/asset-bundle");
const { POST } = await import("@/app/api/upload/image/route");
const mockUpload = vi.spyOn(AssetBundle, "upload");

function makeRequest(formData: FormData) {
	return new NextRequest(
		new URL("/api/upload/image", "http://localhost:3000"),
		{
			method: "POST",
			body: formData,
		},
	);
}

function makeFile(name = "photo.png", type = "image/png", size = 1024): File {
	return new File([new Uint8Array(size)], name, { type });
}

describe("POST /api/upload/image", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockGetUser.mockResolvedValue({ id: "user-1" });
		AssetBundle.baseUrl = "https://assets.test";
		mockUpload.mockResolvedValue({
			id: "bundle-1",
			type: "upload",
			provider: "user",
			result: { image: "photo.png" },
		});
	});

	it("returns 401 when unauthenticated", async () => {
		mockGetUser.mockResolvedValue(null);

		const res = await POST(makeRequest(new FormData()));

		expect(res.status).toBe(401);
	});

	it("returns 400 when no file is provided", async () => {
		const res = await POST(makeRequest(new FormData()));

		expect(res.status).toBe(400);
		expect(await res.json()).toEqual({ error: "No file provided" });
	});

	it("returns 400 for non-image files", async () => {
		const formData = new FormData();
		formData.set("file", makeFile("doc.pdf", "application/pdf"));

		const res = await POST(makeRequest(formData));

		expect(res.status).toBe(400);
		expect(await res.json()).toEqual({ error: "File must be an image" });
	});

	it("returns 400 for files over 10 MB", async () => {
		const formData = new FormData();
		formData.set(
			"file",
			makeFile("big.png", "image/png", 10 * 1024 * 1024 + 1),
		);

		const res = await POST(makeRequest(formData));

		expect(res.status).toBe(400);
		expect(await res.json()).toEqual({ error: "File must be under 10 MB" });
	});

	it("uploads the image and returns its URL", async () => {
		const formData = new FormData();
		formData.set("file", makeFile());

		const res = await POST(makeRequest(formData));

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

		const res = await POST(makeRequest(formData));

		expect(res.status).toBe(200);
		expect(mockUpload).toHaveBeenCalledWith("upload", "user", [
			expect.objectContaining({ filename: "we_ird_.png" }),
		]);
	});
});
