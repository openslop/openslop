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

const MODEL = "bytedance:seedance@2.0-fast";
const FRAMES = [
	"https://img/first.png",
	"https://img/middle.png",
	"https://img/last.png",
];

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
			const result = await provider.submit({
				prompt: "a sunset",
				model: MODEL,
			});

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
			});
			expect(mockDisconnect).toHaveBeenCalled();
		});

		it("opens Kling on its frame and never sends it reference images", async () => {
			mockVideoInference.mockResolvedValue({
				taskUUID: "job-2",
				status: "processing",
			});

			const provider = new RunwareVideo("test-key");
			await provider.submit({
				prompt: "animate this",
				model: "klingai:kling-video@3.0-turbo",
				referenceImages: ["data:image/png;base64,ref"],
				frameImages: ["data:image/png;base64,frame"],
			});

			expect(mockVideoInference).toHaveBeenCalledWith(
				expect.objectContaining({
					inputs: {
						frameImages: ["data:image/png;base64,frame"],
						referenceImages: undefined,
					},
				}),
			);
		});

		it("gives Seedance every start frame after its reference images, naming the last", async () => {
			mockVideoInference.mockResolvedValue({
				taskUUID: "job-s",
				status: "processing",
			});

			await new RunwareVideo("test-key").submit({
				prompt: "animate this",
				model: MODEL,
				referenceImages: ["https://img/avatar.png"],
				frameImages: FRAMES,
			});

			expect(mockVideoInference).toHaveBeenCalledWith(
				expect.objectContaining({
					positivePrompt: "@Image 4 as the first frame. animate this",
					inputs: {
						frameImages: undefined,
						referenceImages: ["https://img/avatar.png", ...FRAMES],
					},
				}),
			);
		});

		it("names the last of Seedance's start frames when it has no other references", async () => {
			mockVideoInference.mockResolvedValue({
				taskUUID: "job-s2",
				status: "processing",
			});

			await new RunwareVideo("test-key").submit({
				prompt: "animate this",
				model: MODEL,
				frameImages: FRAMES,
			});

			expect(mockVideoInference).toHaveBeenCalledWith(
				expect.objectContaining({
					positivePrompt: "@Image 3 as the first frame. animate this",
				}),
			);
		});

		it("opens other models on the last start frame alone", async () => {
			mockVideoInference.mockResolvedValue({
				taskUUID: "job-k3",
				status: "processing",
			});

			await new RunwareVideo("test-key").submit({
				prompt: "animate this",
				model: "klingai:kling-video@3.0-turbo",
				referenceImages: ["https://img/avatar.png"],
				frameImages: FRAMES,
			});

			expect(mockVideoInference).toHaveBeenCalledWith(
				expect.objectContaining({
					positivePrompt: "animate this",
					inputs: {
						frameImages: ["https://img/last.png"],
						referenceImages: undefined,
					},
				}),
			);
		});

		const references = Array.from(
			{ length: 10 },
			(_, i) => `https://img/ref-${i}.png`,
		);

		it.each([
			{
				frameImages: undefined,
				positivePrompt: "animate this",
				sent: references.slice(0, 9),
			},
			{
				frameImages: ["https://img/last.png"],
				positivePrompt: "@Image 9 as the first frame. animate this",
				sent: [...references.slice(0, 8), "https://img/last.png"],
			},
		])(
			"caps Seedance at nine reference images, keeping the first ones and any start frame",
			async ({ frameImages, positivePrompt, sent }) => {
				mockVideoInference.mockResolvedValue({
					taskUUID: "job-s4",
					status: "processing",
				});

				await new RunwareVideo("test-key").submit({
					prompt: "animate this",
					model: MODEL,
					referenceImages: references,
					frameImages,
				});

				expect(mockVideoInference).toHaveBeenCalledWith(
					expect.objectContaining({
						positivePrompt,
						inputs: { frameImages: undefined, referenceImages: sent },
					}),
				);
			},
		);

		it("keeps Seedance's reference images as they are when there is no first frame", async () => {
			mockVideoInference.mockResolvedValue({
				taskUUID: "job-s3",
				status: "processing",
			});

			await new RunwareVideo("test-key").submit({
				prompt: "animate this",
				model: MODEL,
				referenceImages: ["https://img/avatar.png"],
			});

			expect(mockVideoInference).toHaveBeenCalledWith(
				expect.objectContaining({
					positivePrompt: "animate this",
					inputs: {
						frameImages: undefined,
						referenceImages: ["https://img/avatar.png"],
					},
				}),
			);
		});

		it("leaves inputs off a Kling video that starts fresh, which Kling rejects even empty", async () => {
			mockVideoInference.mockResolvedValue({
				taskUUID: "job-k4",
				status: "processing",
			});

			await new RunwareVideo("test-key").submit({
				prompt: "a sunset",
				model: "klingai:kling-video@3.0-turbo",
				referenceImages: ["https://img/avatar.png"],
			});

			expect(mockVideoInference.mock.calls[0]?.[0]).not.toHaveProperty(
				"inputs",
			);
		});

		it("fails loudly for a model it has no profile for", async () => {
			await expect(
				new RunwareVideo("test-key").submit({
					prompt: "a sunset",
					model: "vidu:q3",
				}),
			).rejects.toThrow(/no video model "vidu:q3"/);
			expect(mockVideoInference).not.toHaveBeenCalled();
		});

		it("sizes a frame-conditioned video by resolution preset", async () => {
			mockVideoInference.mockResolvedValue({
				taskUUID: "job-k",
				status: "processing",
			});

			await new RunwareVideo("test-key").submit({
				prompt: "animate this",
				model: "klingai:kling-video@3.0-turbo",
				frameImages: ["https://example.com/still.png"],
				resolution: "1080p",
				width: 1920,
				height: 1080,
			});

			const request = mockVideoInference.mock.calls[0]?.[0];
			expect(request).toMatchObject({ resolution: "1080p" });
			expect(request).not.toHaveProperty("width");
			expect(request).not.toHaveProperty("height");
		});

		it("sizes a prompted video by pixels even when a resolution is named", async () => {
			mockVideoInference.mockResolvedValue({
				taskUUID: "job-k2",
				status: "processing",
			});

			await new RunwareVideo("test-key").submit({
				prompt: "a sunset",
				model: "klingai:kling-video@3.0-turbo",
				resolution: "1080p",
				width: 1920,
				height: 1080,
			});

			const request = mockVideoInference.mock.calls[0]?.[0];
			expect(request).toMatchObject({ width: 1920, height: 1080 });
			expect(request).not.toHaveProperty("resolution");
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
			const result = await provider.submit({ prompt: "test", model: MODEL });

			expect(result.metadata.jobId).toBe("job-arr");
			expect(result.url).toBe("https://v.mp4");
		});

		it("asks the SDK for the ack rather than the finished video", async () => {
			mockVideoInference.mockResolvedValue({
				taskUUID: "job-3",
				status: "processing",
			});

			await new RunwareVideo("test-key").submit({
				prompt: "test",
				model: MODEL,
			});

			expect(mockVideoInference).toHaveBeenCalledWith(
				expect.objectContaining({ skipResponse: true }),
			);
		});

		it("fails loudly when the ack carries no task id", async () => {
			mockVideoInference.mockResolvedValue({});

			await expect(
				new RunwareVideo("test-key").submit({ prompt: "test", model: MODEL }),
			).rejects.toThrow("returned no task");
		});

		it("disconnects on error", async () => {
			mockVideoInference.mockRejectedValue(new Error("fail"));

			const provider = new RunwareVideo("test-key");
			await expect(
				provider.submit({ prompt: "test", model: MODEL }),
			).rejects.toThrow("fail");
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
			const result = await provider.generate({
				prompt: "a sunset",
				model: MODEL,
			});

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
				model: MODEL,
				duration: 10,
			});

			expect(result.metadata.durationSec).toBe(10);
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
				model: MODEL,
				duration: 8,
			});

			expect(poll.kind).toBe("ready");
			expect(poll.kind === "ready" && poll.asset.metadata.durationSec).toBe(8);
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
			const result = await provider.poll("job-1", {
				prompt: "test",
				model: MODEL,
			});

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
			const result = await provider.poll("job-1", {
				prompt: "test",
				model: MODEL,
			});

			expect(result).toEqual({
				kind: "pending",
				metadata: { jobId: "job-1", status: "processing" },
			});
		});

		it("reports a failed job as its own outcome, not as pending", async () => {
			mockGetResponse.mockResolvedValue([
				{ taskUUID: "job-1", status: "failed" },
			]);

			const provider = new RunwareVideo("test-key");
			const result = await provider.poll("job-1", {
				prompt: "test",
				model: MODEL,
			});

			expect(result).toEqual({ kind: "failed" });
		});

		it("throws when job not found", async () => {
			mockGetResponse.mockResolvedValue([]);

			const provider = new RunwareVideo("test-key");
			await expect(
				provider.poll("missing", { prompt: "test", model: MODEL }),
			).rejects.toThrow("Job not found");
			expect(mockDisconnect).toHaveBeenCalled();
		});
	});
});
