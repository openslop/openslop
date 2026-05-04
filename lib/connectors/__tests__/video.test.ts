import { describe, expect, it, vi, beforeEach } from "vitest";
import { OpenSlopVideo } from "../video/openslop";
import type { ConnectorPlugin } from "../types";

const TEST_ID = "test-id";
const VIDEO_URL = "https://cdn.example.com/v.mp4";

function jsonResponse(data: unknown) {
	return new Response(JSON.stringify(data), {
		status: 200,
		headers: { "content-type": "application/json" },
	});
}

function mockFetchChain() {
	vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
		jsonResponse({
			id: TEST_ID,
			provider: "openslop",
			result: { video: VIDEO_URL },
		}),
	);
}

describe("BaseVideoConnector", () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it("generates a video and returns AssetResult (sync path)", async () => {
		mockFetchChain();
		const connector = new OpenSlopVideo({
			defaultModel: "test-model",
			models: ["test-model"],
			isDefault: true,
			apiKey: "",
		});
		const result = await connector.generate({ prompt: "a sunset" });
		expect(result.url).toBe(VIDEO_URL);
	});

	it("polls until video is ready (async path)", async () => {
		vi.spyOn(globalThis, "fetch")
			.mockResolvedValueOnce(
				jsonResponse({
					id: TEST_ID,
					provider: "openslop",
					result: {},
					metadata: { jobId: "job-1", durationSec: 5 },
				}),
			)
			.mockResolvedValueOnce(
				jsonResponse({
					id: "",
					provider: "openslop",
					result: {},
				}),
			)
			.mockResolvedValueOnce(
				jsonResponse({
					id: "completed-id",
					provider: "openslop",
					result: { video: VIDEO_URL },
					metadata: { durationSec: 5 },
				}),
			);

		const connector = new OpenSlopVideo({
			defaultModel: "test-model",
			models: ["test-model"],
			isDefault: true,
			apiKey: "",
		});
		const result = await connector.generate({ prompt: "a sunset" });
		expect(result.url).toBe(VIDEO_URL);
		expect(result.durationSec).toBe(5);
		expect(fetch).toHaveBeenCalledTimes(3);
	});

	it("throws when async generation has no jobId", async () => {
		vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
			jsonResponse({
				id: TEST_ID,
				provider: "openslop",
				result: {},
			}),
		);

		const connector = new OpenSlopVideo({
			defaultModel: "test-model",
			models: ["test-model"],
			isDefault: true,
			apiKey: "",
		});
		await expect(connector.generate({ prompt: "test" })).rejects.toThrow(
			"no jobId",
		);
	});

	it("throws when polled job fails", async () => {
		vi.spyOn(globalThis, "fetch")
			.mockResolvedValueOnce(
				jsonResponse({
					id: TEST_ID,
					provider: "openslop",
					result: {},
					metadata: { jobId: "job-1", durationSec: 5 },
				}),
			)
			.mockResolvedValueOnce(
				jsonResponse({
					id: "",
					provider: "openslop",
					result: {},
					metadata: { status: "failed", error: "GPU unavailable" },
				}),
			);

		const connector = new OpenSlopVideo({
			defaultModel: "test-model",
			models: ["test-model"],
			isDefault: true,
			apiKey: "",
		});
		await expect(connector.generate({ prompt: "test" })).rejects.toThrow(
			"GPU unavailable",
		);
	});

	it("runs plugins in order", async () => {
		mockFetchChain();
		const order: string[] = [];
		const plugin: ConnectorPlugin = {
			name: "tracker",
			transformPrompt: (p) => {
				order.push("transform");
				return p;
			},
			beforeGenerate: (p) => {
				order.push("before");
				return p;
			},
			afterGenerate: (r) => {
				order.push("after");
				return r;
			},
		};
		const connector = new OpenSlopVideo({
			defaultModel: "test-model",
			models: ["test-model"],
			isDefault: true,
			apiKey: "",
			plugins: [plugin],
		});
		await connector.generate({ prompt: "test" });
		expect(order).toEqual(["transform", "before", "after"]);
	});

	it("runs onError plugin on failure", async () => {
		vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("video failed"));
		const errors: string[] = [];

		const connector = new OpenSlopVideo({
			defaultModel: "test-model",
			models: ["test-model"],
			isDefault: true,
			apiKey: "",
			plugins: [{ name: "err", onError: (e) => void errors.push(e) }],
		});

		await expect(connector.generate({ prompt: "test" })).rejects.toThrow();
		expect(errors[0]).toContain("video failed");
	});
});
