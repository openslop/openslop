import { describe, expect, it, vi, beforeEach } from "vitest";
import { OpenSlopVideo } from "../video/openslop";
import type { ConnectorPlugin } from "../types";
import { mockGatewaySequence, mockGatewaySuccess } from "./_gateway-mock";

const TEST_ID = "test-id";
const VIDEO_URL = "https://cdn.example.com/v.mp4";

const config = {
	defaultModel: "test-model",
	models: ["test-model"],
	isDefault: true,
	apiKey: "",
};

function mockSuccess() {
	mockGatewaySuccess({
		id: TEST_ID,
		provider: "openslop",
		result: { video: VIDEO_URL },
		metadata: { durationSec: 5 },
	});
}

describe("BaseVideoConnector", () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it("submits and resolves to AssetResult once the job completes", async () => {
		mockSuccess();
		const result = await new OpenSlopVideo(config).generate({
			prompt: "a sunset",
		});
		expect(result.videoUrl).toBe(VIDEO_URL);
		expect(result.durationSec).toBe(5);
	});

	it("polls while job is still pending then resolves on completion", async () => {
		mockGatewaySequence([
			{ submitStatus: "pending" },
			{ pollStatus: "processing" },
			{
				pollStatus: "completed",
				result: {
					id: TEST_ID,
					provider: "openslop",
					result: { video: VIDEO_URL },
					metadata: { durationSec: 5 },
				},
			},
		]);

		const result = await new OpenSlopVideo(config).generate({
			prompt: "a sunset",
		});
		expect(result.videoUrl).toBe(VIDEO_URL);
		expect(result.durationSec).toBe(5);
		expect(fetch).toHaveBeenCalledTimes(3);
	});

	it("throws when the job fails", async () => {
		mockGatewaySequence([
			{ submitStatus: "pending" },
			{ pollStatus: "failed", error: "GPU unavailable" },
		]);

		await expect(
			new OpenSlopVideo(config).generate({ prompt: "test" }),
		).rejects.toThrow("GPU unavailable");
	});

	it("runs plugins in order", async () => {
		mockSuccess();
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
		await new OpenSlopVideo({ ...config, plugins: [plugin] }).generate({
			prompt: "test",
		});
		expect(order).toEqual(["transform", "before", "after"]);
	});

	it("runs onError plugin on failure", async () => {
		vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("video failed"));
		const errors: string[] = [];
		const connector = new OpenSlopVideo({
			...config,
			plugins: [{ name: "err", onError: (e) => void errors.push(e) }],
		});

		await expect(connector.generate({ prompt: "test" })).rejects.toThrow();
		expect(errors[0]).toContain("video failed");
	});
});
