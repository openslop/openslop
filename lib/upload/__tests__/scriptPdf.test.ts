import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { extractScriptText } from "../scriptPdf";

const file = new File(["x"], "script.pdf", { type: "application/pdf" });

describe("extractScriptText", () => {
	const fetchMock = vi.fn();

	beforeEach(() => {
		fetchMock.mockReset();
		vi.stubGlobal("fetch", fetchMock);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("returns the extracted text on success", async () => {
		fetchMock.mockResolvedValue({
			ok: true,
			status: 200,
			json: async () => ({ text: "EXT. NIGHT" }),
		});
		await expect(extractScriptText(file)).resolves.toBe("EXT. NIGHT");
	});

	it("throws the route's error message when the response is not ok", async () => {
		fetchMock.mockResolvedValue({
			ok: false,
			status: 400,
			statusText: "Bad Request",
			json: async () => ({ error: "File must be a PDF" }),
		});
		await expect(extractScriptText(file)).rejects.toThrow("File must be a PDF");
	});

	it("propagates network failures", async () => {
		fetchMock.mockRejectedValue(new TypeError("network down"));
		await expect(extractScriptText(file)).rejects.toThrow("network down");
	});
});
