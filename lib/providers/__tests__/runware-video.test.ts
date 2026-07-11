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
		it("returns BundleResponse when job is completed", async () => {
			mockGetResponse.mockResolvedValue([
				{
					taskUUID: "job-1",
					status: "completed",
					videoURL: "https://result.mp4",
				},
			]);

			const provider = new RunwareVideo("test-key");
			const result = await provider.poll("job-1");

			expect(result.result.video).toBe("https://result.mp4");
			expect(mockDisconnect).toHaveBeenCalled();
		});

		it("returns empty BundleResponse when job is pending", async () => {
			mockGetResponse.mockResolvedValue([
				{
					taskUUID: "job-1",
					status: "processing",
				},
			]);

			const provider = new RunwareVideo("test-key");
			const result = await provider.poll("job-1");

			expect(result.id).toBe("");
			expect(result.result).toEqual({});
		});

		it("throws when job not found", async () => {
			mockGetResponse.mockResolvedValue([]);

			const provider = new RunwareVideo("test-key");
			await expect(provider.poll("missing")).rejects.toThrow("Job not found");
			expect(mockDisconnect).toHaveBeenCalled();
		});

		it("surfaces a human message on error and the full payload on errorDetail (resolved item)", async () => {
			const errorDetail = {
				code: "invalidValueUploadFailed",
				message: "Processing parameter 'inputs.frameImages' failed.",
				parameter: "inputs.frameImages",
			};
			mockGetResponse.mockResolvedValue([
				{ taskUUID: "job-1", status: "failed", error: errorDetail },
			]);

			const provider = new RunwareVideo("test-key");
			const result = await provider.poll("job-1");

			expect(result.metadata?.status).toBe("failed");
			// error is the human message (renders in the banner), NOT a JSON dump.
			expect(result.metadata?.error).toBe(
				"Processing parameter 'inputs.frameImages' failed.",
			);
			expect(result.metadata?.error).not.toContain("{");
			expect(result.metadata?.errorDetail).toEqual(errorDetail);
		});

		it("surfaces a human message on error and the full payload on errorDetail (rejected query, wrapped shape)", async () => {
			const rejection = {
				error: {
					code: "invalidValueUploadFailed",
					message: "Processing parameter 'inputs.frameImages' failed.",
					parameter: "inputs.frameImages",
				},
			};
			mockGetResponse.mockRejectedValue(rejection);

			const provider = new RunwareVideo("test-key");
			const result = await provider.poll("job-1");

			expect(result.metadata?.status).toBe("failed");
			// Pulled from the nested error.message, not a stringify of the wrapper.
			expect(result.metadata?.error).toBe(
				"Processing parameter 'inputs.frameImages' failed.",
			);
			expect(result.metadata?.error).not.toContain("{");
			expect(result.metadata?.errorDetail).toEqual(rejection);
			expect(mockDisconnect).toHaveBeenCalled();
		});

		it("falls back to a generic message when the failure has no readable message", async () => {
			mockGetResponse.mockResolvedValue([
				{ taskUUID: "job-1", status: "failed", error: { code: "weird" } },
			]);

			const provider = new RunwareVideo("test-key");
			const result = await provider.poll("job-1");

			expect(result.metadata?.error).toBe("Video generation failed");
			expect(result.metadata?.errorDetail).toEqual({ code: "weird" });
		});

		it("rethrows a transient connection error instead of treating it as a permanent failure", async () => {
			mockGetResponse.mockRejectedValue(new Error("WebSocket disconnected"));

			const provider = new RunwareVideo("test-key");
			await expect(provider.poll("job-1")).rejects.toThrow(
				"WebSocket disconnected",
			);
			expect(mockDisconnect).toHaveBeenCalled();
		});

		it("does not report a null error field as a failure", async () => {
			mockGetResponse.mockResolvedValue([
				{
					taskUUID: "job-1",
					status: "completed",
					videoURL: "https://result.mp4",
					error: null,
				},
			]);

			const provider = new RunwareVideo("test-key");
			const result = await provider.poll("job-1");

			expect(result.result.video).toBe("https://result.mp4");
			expect(result.metadata?.error).toBeUndefined();
		});
	});
});
