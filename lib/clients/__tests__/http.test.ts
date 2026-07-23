import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiFetch, apiJson } from "../http";

describe("apiFetch", () => {
	let fetchMock: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		fetchMock = vi.fn();
		vi.stubGlobal("fetch", fetchMock);
	});

	it("defaults to GET without a body", async () => {
		fetchMock.mockResolvedValue({ ok: true });

		await apiFetch("/api/render");

		expect(fetchMock).toHaveBeenCalledWith("/api/render", { method: "GET" });
	});

	it("JSON-encodes plain object bodies", async () => {
		fetchMock.mockResolvedValue({ ok: true });

		await apiFetch("/api/render", { method: "POST", body: { scale: 2 } });

		expect(fetchMock).toHaveBeenCalledWith("/api/render", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ scale: 2 }),
		});
	});

	it("passes FormData through so the browser sets the boundary", async () => {
		fetchMock.mockResolvedValue({ ok: true });
		const body = new FormData();

		await apiFetch("/api/upload/image", { method: "POST", body });

		expect(fetchMock).toHaveBeenCalledWith("/api/upload/image", {
			method: "POST",
			body,
		});
	});

	it("throws the route's error message", async () => {
		fetchMock.mockResolvedValue({
			ok: false,
			status: 400,
			statusText: "Bad Request",
			json: () => Promise.resolve({ error: "File must be under 10 MB" }),
		});

		await expect(apiFetch("/api/upload/image")).rejects.toThrow(
			"File must be under 10 MB",
		);
	});

	it("falls back to the status line when there is no error message", async () => {
		fetchMock.mockResolvedValue({
			ok: false,
			status: 500,
			statusText: "Internal Server Error",
			json: () => Promise.reject(new Error("not json")),
		});

		await expect(apiFetch("/api/render")).rejects.toThrow(
			"500 Internal Server Error",
		);
	});
});

describe("apiJson", () => {
	it("returns the parsed body", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve({ url: "https://blob/img.png" }),
			}),
		);

		await expect(apiJson("/api/upload/image")).resolves.toEqual({
			url: "https://blob/img.png",
		});
	});
});

describe("query params", () => {
	let fetchMock: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		fetchMock = vi.fn().mockResolvedValue({ ok: true });
		vi.stubGlobal("fetch", fetchMock);
	});

	it("appends encoded params", async () => {
		await apiFetch("/api/v1/tts/voices", { params: { gender: "feminine" } });

		expect(fetchMock).toHaveBeenCalledWith(
			"/api/v1/tts/voices?gender=feminine",
			expect.anything(),
		);
	});

	it("drops undefined values and an empty query string", async () => {
		const params = { age: undefined } as unknown as Record<string, string>;

		await apiFetch("/api/v1/tts/voices", { params });

		expect(fetchMock).toHaveBeenCalledWith(
			"/api/v1/tts/voices",
			expect.anything(),
		);
	});
});
