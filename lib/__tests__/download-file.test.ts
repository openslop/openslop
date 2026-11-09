// @vitest-environment happy-dom

import { afterEach, describe, expect, it, vi } from "vitest";
import { downloadFile } from "../download-file";

const respond = (body: Blob, status = 200) =>
	vi
		.spyOn(globalThis, "fetch")
		.mockResolvedValueOnce(new Response(body, { status }));

describe("downloadFile", () => {
	afterEach(() => vi.restoreAllMocks());

	it("saves the file under its name with the URL's extension", async () => {
		respond(new Blob(["x"], { type: "audio/mpeg" }));
		URL.createObjectURL = vi.fn(() => "blob:x");
		URL.revokeObjectURL = vi.fn();
		const click = vi
			.spyOn(HTMLAnchorElement.prototype, "click")
			.mockImplementation(() => {});

		await downloadFile("https://cdn.test/a.mp3", "sunset");

		const link = click.mock.contexts[0] as HTMLAnchorElement;
		expect(link.download).toBe("sunset.mp3");
		expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:x");
	});

	it("fails loudly when the file can't be fetched", async () => {
		respond(new Blob([]), 404);
		await expect(
			downloadFile("https://cdn.test/a.png", "sunset"),
		).rejects.toThrow("HTTP 404");
	});
});
