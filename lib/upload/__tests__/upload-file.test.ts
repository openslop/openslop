import { beforeEach, describe, expect, it, vi } from "vitest";
import { uploadFile } from "../upload-file";
import { UPLOAD_PATHNAME } from "../upload-files";

const mockUpload = vi.fn();
vi.mock("@vercel/blob/client", () => ({
	upload: (...args: unknown[]) => mockUpload(...args),
}));

const file = new File(["x"], "my clip.mp4", { type: "video/mp4" });

describe("uploadFile", () => {
	beforeEach(() => {
		mockUpload.mockReset();
		mockUpload.mockResolvedValue({ url: "https://blob/x.mp4" });
	});

	it("returns the url of the uploaded blob", async () => {
		await expect(uploadFile("video", file)).resolves.toBe("https://blob/x.mp4");
	});

	it("uploads straight to the store through the route for its kind", async () => {
		await uploadFile("video", file);

		const [pathname, body, options] = mockUpload.mock.calls[0];
		expect(pathname).toMatch(UPLOAD_PATHNAME);
		expect(pathname).toMatch(/\/my_clip\.mp4$/);
		expect(body).toBe(file);
		expect(options).toEqual({
			access: "public",
			handleUploadUrl: "/api/upload/video",
			contentType: "video/mp4",
		});
	});

	it("propagates upload failures", async () => {
		mockUpload.mockRejectedValue(new Error("Vercel Blob: too large"));

		await expect(uploadFile("video", file)).rejects.toThrow(
			"Vercel Blob: too large",
		);
	});
});
