import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { uploadImage } from "../uploadImage";

const file = new File(["x"], "x.png", { type: "image/png" });

describe("uploadImage", () => {
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
		await expect(uploadImage(file)).resolves.toBe("https://blob/x.png");
	});

	it("throws status and body when response is not ok", async () => {
		fetchMock.mockResolvedValue({
			ok: false,
			status: 400,
			text: async () => "File must be under 10 MB",
		});
		await expect(uploadImage(file)).rejects.toThrow(
			"400 File must be under 10 MB",
		);
	});

	it("propagates network failures", async () => {
		fetchMock.mockRejectedValue(new TypeError("network down"));
		await expect(uploadImage(file)).rejects.toThrow("network down");
	});
});
