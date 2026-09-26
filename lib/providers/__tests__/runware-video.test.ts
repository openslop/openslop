import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/api/asset-bundle");

type Voice = { url: string; durationSec: number };

const mockCutVoice = vi.hoisted(() =>
	vi.fn(async (voice: Voice, seconds: number) =>
		voice.durationSec > seconds
			? { url: `${voice.url}#${seconds}s`, durationSec: seconds }
			: voice,
	),
);

vi.mock("../audio-cut", async (importOriginal) => ({
	...(await importOriginal<typeof import("../audio-cut")>()),
	cutVoice: mockCutVoice,
}));

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
				frameImage: "data:image/png;base64,frame",
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

		it("gives Seedance its start frame after its reference images, naming it", async () => {
			mockVideoInference.mockResolvedValue({
				taskUUID: "job-s",
				status: "processing",
			});

			await new RunwareVideo("test-key").submit({
				prompt: "animate this",
				model: MODEL,
				referenceImages: ["https://img/avatar.png"],
				frameImage: "https://img/last.png",
			});

			expect(mockVideoInference).toHaveBeenCalledWith(
				expect.objectContaining({
					positivePrompt: "@Image 2 as the first frame. animate this",
					inputs: {
						frameImages: undefined,
						referenceImages: ["https://img/avatar.png", "https://img/last.png"],
					},
				}),
			);
		});

		it("names Seedance's start frame when it has no other references", async () => {
			mockVideoInference.mockResolvedValue({
				taskUUID: "job-s2",
				status: "processing",
			});

			await new RunwareVideo("test-key").submit({
				prompt: "animate this",
				model: MODEL,
				frameImage: "https://img/last.png",
			});

			expect(mockVideoInference).toHaveBeenCalledWith(
				expect.objectContaining({
					positivePrompt: "@Image 1 as the first frame. animate this",
					inputs: {
						frameImages: undefined,
						referenceImages: ["https://img/last.png"],
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
				frameImage: undefined,
				positivePrompt: "animate this",
				sent: references.slice(0, 9),
			},
			{
				frameImage: "https://img/last.png",
				positivePrompt: "@Image 9 as the first frame. animate this",
				sent: [...references.slice(0, 8), "https://img/last.png"],
			},
		])(
			"caps Seedance at nine reference images, keeping the first ones and any start frame",
			async ({ frameImage, positivePrompt, sent }) => {
				mockVideoInference.mockResolvedValue({
					taskUUID: "job-s4",
					status: "processing",
				});

				await new RunwareVideo("test-key").submit({
					prompt: "animate this",
					model: MODEL,
					referenceImages: references,
					frameImage,
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

		const SOL = {
			url: "https://audio/sol.mp3",
			speaker: "Sol",
			durationSec: 6,
		};
		const VOICES = [
			SOL,
			{ url: "https://audio/mira.mp3", speaker: "Mira", durationSec: 8 },
		];

		it("names each voice Seedance hears after its speaker, following the start frame", async () => {
			mockVideoInference.mockResolvedValue({
				taskUUID: "job-a1",
				status: "processing",
			});

			await new RunwareVideo("test-key").submit({
				prompt: "they talk",
				model: MODEL,
				referenceImages: ["https://img/avatar.png"],
				frameImage: "https://img/last.png",
				referenceAudios: VOICES,
			});

			expect(mockVideoInference).toHaveBeenCalledWith(
				expect.objectContaining({
					positivePrompt:
						"@Image 2 as the first frame. @Audio 1 defines Sol's vocal timbre, pitch, and speech cadence. @Audio 2 defines Mira's vocal timbre, pitch, and speech cadence. they talk",
					inputs: {
						referenceImages: ["https://img/avatar.png", "https://img/last.png"],
						referenceAudios: [
							"https://audio/sol.mp3",
							"https://audio/mira.mp3",
						],
					},
				}),
			);
		});

		it("still gives Seedance its voices when there is no picture", async () => {
			mockVideoInference.mockResolvedValue({
				taskUUID: "job-a2",
				status: "processing",
			});

			await new RunwareVideo("test-key").submit({
				prompt: "they talk",
				model: MODEL,
				referenceAudios: VOICES,
			});

			expect(mockVideoInference).toHaveBeenCalledWith(
				expect.objectContaining({
					positivePrompt:
						"@Audio 1 defines Sol's vocal timbre, pitch, and speech cadence. @Audio 2 defines Mira's vocal timbre, pitch, and speech cadence. they talk",
					inputs: {
						referenceAudios: [
							"https://audio/sol.mp3",
							"https://audio/mira.mp3",
						],
					},
				}),
			);
		});

		it("caps Seedance at three voices, keeping the first ones", async () => {
			mockVideoInference.mockResolvedValue({
				taskUUID: "job-a3",
				status: "processing",
			});
			const voices = ["Sol", "Mira", "Ash", "Kai"].map((speaker) => ({
				url: `https://audio/${speaker}.mp3`,
				speaker,
				durationSec: 4,
			}));

			await new RunwareVideo("test-key").submit({
				prompt: "they talk",
				model: MODEL,
				referenceImages: ["https://img/avatar.png"],
				referenceAudios: voices,
			});

			expect(mockVideoInference).toHaveBeenCalledWith(
				expect.objectContaining({
					positivePrompt:
						"@Audio 1 defines Sol's vocal timbre, pitch, and speech cadence. @Audio 2 defines Mira's vocal timbre, pitch, and speech cadence. @Audio 3 defines Ash's vocal timbre, pitch, and speech cadence. they talk",
					inputs: {
						referenceImages: ["https://img/avatar.png"],
						referenceAudios: voices.slice(0, 3).map(({ url }) => url),
					},
				}),
			);
		});

		it("cuts voices evenly so that all of them fit Seedance's 15 s together", async () => {
			mockVideoInference.mockResolvedValue({
				taskUUID: "job-a6",
				status: "processing",
			});
			const voices = ["Sol", "Mira"].map((speaker) => ({
				url: `https://audio/${speaker}.mp3`,
				speaker,
				durationSec: 10,
			}));

			await new RunwareVideo("test-key").submit({
				prompt: "they talk",
				model: MODEL,
				referenceImages: ["https://img/avatar.png"],
				referenceAudios: voices,
			});

			expect(mockVideoInference).toHaveBeenCalledWith(
				expect.objectContaining({
					positivePrompt:
						"@Audio 1 defines Sol's vocal timbre, pitch, and speech cadence. @Audio 2 defines Mira's vocal timbre, pitch, and speech cadence. they talk",
					inputs: {
						referenceImages: ["https://img/avatar.png"],
						referenceAudios: [
							"https://audio/Sol.mp3#7.5s",
							"https://audio/Mira.mp3#7.5s",
						],
					},
				}),
			);
		});

		it("drops a voice too short to hear, and does not count it", async () => {
			mockVideoInference.mockResolvedValue({
				taskUUID: "job-a8",
				status: "processing",
			});

			await new RunwareVideo("test-key").submit({
				prompt: "they talk",
				model: MODEL,
				referenceImages: ["https://img/avatar.png"],
				referenceAudios: [
					{ url: "https://audio/blip.mp3", speaker: "Blip", durationSec: 1 },
					...VOICES,
					{ url: "https://audio/long.mp3", speaker: "Long", durationSec: 16 },
				],
			});

			expect(mockVideoInference).toHaveBeenCalledWith(
				expect.objectContaining({
					positivePrompt:
						"@Audio 1 defines Sol's vocal timbre, pitch, and speech cadence. @Audio 2 defines Mira's vocal timbre, pitch, and speech cadence. @Audio 3 defines Long's vocal timbre, pitch, and speech cadence. they talk",
					inputs: {
						referenceImages: ["https://img/avatar.png"],
						referenceAudios: [
							"https://audio/sol.mp3#5s",
							"https://audio/mira.mp3#5s",
							"https://audio/long.mp3#5s",
						],
					},
				}),
			);
		});

		it("never sends Kling a voice", async () => {
			mockVideoInference.mockResolvedValue({
				taskUUID: "job-a4",
				status: "processing",
			});

			await new RunwareVideo("test-key").submit({
				prompt: "they talk",
				model: "klingai:kling-video@3.0-turbo",
				frameImage: "https://img/last.png",
				referenceAudios: VOICES,
			});

			expect(mockVideoInference).toHaveBeenCalledWith(
				expect.objectContaining({
					positivePrompt: "they talk",
					inputs: { frameImages: ["https://img/last.png"] },
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
				frameImage: "https://example.com/still.png",
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
