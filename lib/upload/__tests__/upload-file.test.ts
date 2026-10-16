import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UnreachableError } from "@/lib/clients/http";
import { uploadFile } from "../upload-file";

const file = new File(["x"], "x.png", { type: "image/png" });

describe("uploadFile", () => {
	const fetchMock = vi.fn();

	beforeEach(() => {
		fetchMock.mockReset();
		vi.stubGlobal("fetch", fetchMock);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("returns the url on success", async () => {
		fetchMock.mockResolvedValue({
			ok: true,
			status: 200,
			json: async () => ({ url: "https://blob/x.png" }),
		});
		await expect(uploadFile("image", file)).resolves.toBe("https://blob/x.png");
	});

	it("posts to the route for its kind", async () => {
		fetchMock.mockResolvedValue({
			ok: true,
			status: 200,
			json: async () => ({ url: "https://blob/x.mp4" }),
		});
		await uploadFile("video", file);
		expect(fetchMock).toHaveBeenCalledWith(
			"/api/upload/video",
			expect.objectContaining({ method: "POST" }),
		);
	});

	it("throws the route's error message when the response is not ok", async () => {
		fetchMock.mockResolvedValue({
			ok: false,
			status: 400,
			statusText: "Bad Request",
			json: async () => ({ error: "File must be under 10 MB" }),
		});
		await expect(uploadFile("image", file)).rejects.toThrow(
			"File must be under 10 MB",
		);
	});

	it("falls back to the status line when the body has no error", async () => {
		fetchMock.mockResolvedValue({
			ok: false,
			status: 502,
			statusText: "Bad Gateway",
			json: async () => ({}),
		});
		await expect(uploadFile("image", file)).rejects.toThrow("502 Bad Gateway");
	});

	it("propagates network failures", async () => {
		fetchMock.mockRejectedValue(new TypeError("network down"));
		await expect(uploadFile("image", file)).rejects.toBeInstanceOf(
			UnreachableError,
		);
	});
});
