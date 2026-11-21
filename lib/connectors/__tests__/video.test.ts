import { describe, expect, it, vi } from "vitest";
import { HttpVideoConnector } from "../video/connector";
import { mockGatewaySequence, mockGatewaySuccess } from "./_gateway-mock";

const TEST_ID = "test-id";
const VIDEO_URL = "https://cdn.example.com/v.mp4";

const config = {
	projectId: "project-1",
	model: { provider: "openslop", model: "Seedance 2 Fast" },
} as const;

function mockSuccess() {
	mockGatewaySuccess({
		id: TEST_ID,
		type: "video",
		provider: "openslop",
		result: { video: VIDEO_URL },
		metadata: { durationSec: 5 },
	});
}

describe("HttpVideoConnector", () => {
	it("submits and resolves to AssetResult once the job completes", async () => {
		mockSuccess();
		const result = await new HttpVideoConnector(config).generate({
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
					type: "video",
					provider: "openslop",
					result: { video: VIDEO_URL },
					metadata: { durationSec: 5 },
				},
			},
		]);

		vi.useFakeTimers();
		const pending = new HttpVideoConnector(config).generate({
			prompt: "a sunset",
		});
		await vi.runAllTimersAsync();
		const result = await pending;
		vi.useRealTimers();
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
			new HttpVideoConnector(config).generate({ prompt: "test" }),
		).rejects.toThrow("GPU unavailable");
	});
});
