import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/api/asset-bundle");

const mockDisconnect = vi.fn();
const mockVideoInference = vi.fn();
const mockGetResponse = vi.fn();

vi.mock("@runware/sdk-js", () => ({
	Runware: class {
		constructor() {
			return {
				videoInference: mockVideoInference,
				getResponse: mockGetResponse,
				disconnect: mockDisconnect,
			};
		}
	},
}));

import { RunwareVideo } from "../video/runware";

describe("RunwareVideo", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("submit", () => {
		it("submits a video job with defaults and deliveryMethod async", async () => {
			mockVideoInference.mockResolvedValue({
				taskUUID: "job-1",
				status: "processing",
				videoURL: undefined,
			});

			const provider = new RunwareVideo("test-key");
			const result = await provider.submit({ prompt: "a sunset" });

			expect(result).toEqual({
				url: undefined,
				metadata: { jobId: "job-1", status: "processing" },
			});
			expect(mockVideoInference).toHaveBeenCalledWith({
				positivePrompt: "a sunset",
				model: "bytedance:seedance@2.0-fast",
				width: 1280,
				height: 720,
				duration: 5,
				outputType: "URL",
				deliveryMethod: "async",
				skipResponse: true,
				inputs: {
					frameImages: undefined,
					referenceImages: undefined,
				},
				settings: {
					audio: false,
				},
			});
			expect(mockDisconnect).toHaveBeenCalled();
		});

		it("passes referenceImages and frameImages through separately", async () => {
			mockVideoInference.mockResolvedValue({
				taskUUID: "job-2",
				status: "processing",
			});

			const provider = new RunwareVideo("test-key");
			await provider.submit({
				prompt: "animate this",
				referenceImages: ["data:image/png;base64,ref"],
				frameImages: ["data:image/png;base64,frame"],
			});

			expect(mockVideoInference).toHaveBeenCalledWith(
				expect.objectContaining({
					inputs: {
						frameImages: ["data:image/png;base64,frame"],
						referenceImages: ["data:image/png;base64,ref"],
					},
				}),
			);
		});

		it("handles array response from videoInference", async () => {
			mockVideoInference.mockResolvedValue([
				{
					taskUUID: "job-arr",
					status: "completed",
					videoURL: "https://v.mp4",
				},
			]);

			const provider = new RunwareVideo("test-key");
			const result = await provider.submit({ prompt: "test" });

			expect(result.metadata?.jobId).toBe("job-arr");
			expect(result.url).toBe("https://v.mp4");
		});

		// Without skipResponse the SDK polls the task to completion before it
		// returns, holding the queue worker open for the whole generation.
		it("asks the SDK for the ack rather than the finished video", async () => {
			mockVideoInference.mockResolvedValue({
				taskUUID: "job-3",
				status: "processing",
			});

			await new RunwareVideo("test-key").submit({ prompt: "test" });

			expect(mockVideoInference).toHaveBeenCalledWith(
				expect.objectContaining({ skipResponse: true }),
			);
		});

		it("fails loudly when the ack carries no task id", async () => {
			mockVideoInference.mockResolvedValue({});

			await expect(
				new RunwareVideo("test-key").submit({ prompt: "test" }),
			).rejects.toThrow("returned no task");
		});

		it("disconnects on error", async () => {
			mockVideoInference.mockRejectedValue(new Error("fail"));

			const provider = new RunwareVideo("test-key");
			await expect(provider.submit({ prompt: "test" })).rejects.toThrow("fail");
			expect(mockDisconnect).toHaveBeenCalled();
		});
	});

	describe("generate", () => {
		it("submits and returns BundleResponse with metadata", async () => {
			mockVideoInference.mockResolvedValue({
				taskUUID: "job-1",
				status: "processing",
			});

			const provider = new RunwareVideo("test-key");
			const result = await provider.generate({ prompt: "a sunset" });

			expect(result.provider).toBe("runware");
			expect(result.metadata).toEqual({
				jobId: "job-1",
				status: "processing",
				durationSec: 5,
			});
		});

		it("uses custom duration in metadata", async () => {
			mockVideoInference.mockResolvedValue({
				taskUUID: "job-2",
				status: "processing",
			});

			const provider = new RunwareVideo("test-key");
			const result = await provider.generate({
				prompt: "test",
				duration: 10,
			});

			expect(result.metadata?.durationSec).toBe(10);
		});
	});

	describe("poll", () => {
		it("stamps the completed asset with the duration that was requested", async () => {
			mockGetResponse.mockResolvedValue([
				{ taskUUID: "job-1", status: "completed", videoURL: "https://r.mp4" },
			]);

			const provider = new RunwareVideo("test-key");
			const poll = await provider.poll("job-1", {
				prompt: "test",
				duration: 8,
			});

			expect(poll.kind).toBe("ready");
			expect(poll.kind === "ready" && poll.asset.metadata?.durationSec).toBe(8);
		});

		it("returns the stored asset when the job is completed", async () => {
			mockGetResponse.mockResolvedValue([
				{
					taskUUID: "job-1",
					status: "completed",
					videoURL: "https://result.mp4",
				},
			]);

			const provider = new RunwareVideo("test-key");
			const result = await provider.poll("job-1", { prompt: "test" });

			expect(result).toMatchObject({
				kind: "ready",
				asset: { result: { video: "https://result.mp4" } },
			});
			expect(mockDisconnect).toHaveBeenCalled();
		});

		it("reports pending with the upstream status while the job runs", async () => {
			mockGetResponse.mockResolvedValue([
				{
					taskUUID: "job-1",
					status: "processing",
				},
			]);

			const provider = new RunwareVideo("test-key");
			const result = await provider.poll("job-1", { prompt: "test" });

			expect(result).toEqual({
				kind: "pending",
				metadata: { jobId: "job-1", status: "processing" },
			});
		});

		it("throws when job not found", async () => {
			mockGetResponse.mockResolvedValue([]);

			const provider = new RunwareVideo("test-key");
			await expect(
				provider.poll("missing", { prompt: "test" }),
			).rejects.toThrow("Job not found");
			expect(mockDisconnect).toHaveBeenCalled();
		});
	});
});
