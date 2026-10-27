import { describe, expect, it, vi, beforeEach } from "vitest";

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

import { EmptyRemoteFileError } from "@/lib/api/asset-bundle";
import { chargedUsd } from "../base";
import { RunwareVideo } from "../video/runware";
import { spyAssetBundle } from "./_asset-bundle";

const MODEL = "bytedance:seedance@2.0-fast";
const SEEDANCE_25 = "bytedance:seedance@2.5";

describe("RunwareVideo", () => {
	const { upload } = spyAssetBundle();

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

			expect(result).toBe("job-1");
			expect(upload).not.toHaveBeenCalled();
			expect(mockVideoInference).toHaveBeenCalledWith({
				positivePrompt: "a sunset",
				model: "bytedance:seedance@2.0-fast",
				width: 1280,
				height: 720,
				duration: 5,
				outputType: "URL",
				deliveryMethod: "async",
				includeCost: true,
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

		const speaking = (name: string, url: string, durationSec: number) => ({
			name,
			voice: { url, durationSec },
		});
		const SOL = speaking("Sol", "https://audio/sol.mp3", 6);
		const VOICES = [SOL, speaking("Mira", "https://audio/mira.mp3", 8)];

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
				characterAssets: VOICES,
			});

			expect(mockVideoInference).toHaveBeenCalledWith(
				expect.objectContaining({
					positivePrompt:
						"@Image 2 as the first frame. @Audio1 defines Sol's vocal timbre, pitch, and speech cadence. @Audio2 defines Mira's vocal timbre, pitch, and speech cadence. they talk",
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

		it.each([
			{
				model: MODEL,
				positivePrompt: "they talk",
				inputs: undefined,
			},
			{
				model: SEEDANCE_25,
				positivePrompt:
					"@Audio1 defines Sol's vocal timbre, pitch, and speech cadence. @Audio2 defines Mira's vocal timbre, pitch, and speech cadence. they talk",
				inputs: {
					referenceAudios: ["https://audio/sol.mp3", "https://audio/mira.mp3"],
				},
			},
		])(
			"gives $model voices with no picture only when it takes audio alone",
			async ({ model, positivePrompt, inputs }) => {
				mockVideoInference.mockResolvedValue({
					taskUUID: "job-a2",
					status: "processing",
				});

				await new RunwareVideo("test-key").submit({
					prompt: "they talk",
					model,
					characterAssets: VOICES,
				});

				const request = mockVideoInference.mock.calls[0]?.[0];
				expect(request.positivePrompt).toBe(positivePrompt);
				expect(request.inputs).toEqual(inputs);
			},
		);

		it("caps Seedance at three voices, keeping the first ones", async () => {
			mockVideoInference.mockResolvedValue({
				taskUUID: "job-a3",
				status: "processing",
			});
			const voices = ["Sol", "Mira", "Ash", "Kai"].map((name) =>
				speaking(name, `https://audio/${name}.mp3`, 4),
			);

			await new RunwareVideo("test-key").submit({
				prompt: "they talk",
				model: MODEL,
				referenceImages: ["https://img/avatar.png"],
				characterAssets: voices,
			});

			expect(mockVideoInference).toHaveBeenCalledWith(
				expect.objectContaining({
					positivePrompt:
						"@Audio1 defines Sol's vocal timbre, pitch, and speech cadence. @Audio2 defines Mira's vocal timbre, pitch, and speech cadence. @Audio3 defines Ash's vocal timbre, pitch, and speech cadence. they talk",
					inputs: {
						referenceImages: ["https://img/avatar.png"],
						referenceAudios: voices.slice(0, 3).map(({ voice }) => voice.url),
					},
				}),
			);
		});

		it("cuts voices evenly so that all of them fit Seedance's 15 s together", async () => {
			mockVideoInference.mockResolvedValue({
				taskUUID: "job-a6",
				status: "processing",
			});
			const voices = ["Sol", "Mira"].map((name) =>
				speaking(name, `https://audio/${name}.mp3`, 10),
			);

			await new RunwareVideo("test-key").submit({
				prompt: "they talk",
				model: MODEL,
				referenceImages: ["https://img/avatar.png"],
				characterAssets: voices,
			});

			expect(mockVideoInference).toHaveBeenCalledWith(
				expect.objectContaining({
					positivePrompt:
						"@Audio1 defines Sol's vocal timbre, pitch, and speech cadence. @Audio2 defines Mira's vocal timbre, pitch, and speech cadence. they talk",
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
				characterAssets: [
					speaking("Blip", "https://audio/blip.mp3", 1),
					...VOICES,
					speaking("Long", "https://audio/long.mp3", 16),
				],
			});

			expect(mockVideoInference).toHaveBeenCalledWith(
				expect.objectContaining({
					positivePrompt:
						"@Audio1 defines Sol's vocal timbre, pitch, and speech cadence. @Audio2 defines Mira's vocal timbre, pitch, and speech cadence. @Audio3 defines Long's vocal timbre, pitch, and speech cadence. they talk",
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

		it("lets Seedance 2.5 hear ten voices sharing 30 s, and see 30 pictures", async () => {
			mockVideoInference.mockResolvedValue({
				taskUUID: "job-a9",
				status: "processing",
			});
			const voices = Array.from({ length: 11 }, (_, i) =>
				speaking(`V${i}`, `https://audio/v${i}.mp3`, 6),
			);
			const pictures = Array.from(
				{ length: 31 },
				(_, i) => `https://img/ref-${i}.png`,
			);

			await new RunwareVideo("test-key").submit({
				prompt: "they talk",
				model: SEEDANCE_25,
				referenceImages: pictures,
				characterAssets: voices,
			});

			const { inputs } = mockVideoInference.mock.calls[0]?.[0];
			expect(inputs.referenceImages).toEqual(pictures.slice(0, 30));
			expect(inputs.referenceAudios).toEqual(
				voices.slice(0, 10).map(({ voice }) => `${voice.url}#3s`),
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
				characterAssets: VOICES,
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

		it("puts each character Seedance sees as their avatar's image, then the references, then the previous scene", async () => {
			mockVideoInference.mockResolvedValue({
				taskUUID: "job-s5",
				status: "processing",
			});

			await new RunwareVideo("test-key").submit({
				prompt: "{{Sol}} talks to {{Mira}} and {{Kai}}",
				model: MODEL,
				characterAssets: [
					{ name: "Sol", avatarUrl: "https://img/sol.png" },
					{ name: "Mira", avatarUrl: "https://img/mira.png" },
				],
				referenceImages: ["https://img/ref.png"],
				continuityFrames: ["https://img/first.png"],
			});

			expect(mockVideoInference).toHaveBeenCalledWith(
				expect.objectContaining({
					positivePrompt: "@Image 1 talks to @Image 2 and Kai",
					inputs: {
						referenceImages: [
							"https://img/sol.png",
							"https://img/mira.png",
							"https://img/ref.png",
							"https://img/first.png",
						],
					},
				}),
			);
		});

		it("ties a pictured speaker's voice to their image", async () => {
			mockVideoInference.mockResolvedValue({
				taskUUID: "job-s6",
				status: "processing",
			});

			await new RunwareVideo("test-key").submit({
				prompt: "{{Sol}} waves",
				model: MODEL,
				characterAssets: [{ ...SOL, avatarUrl: "https://img/sol.png" }],
			});

			expect(mockVideoInference.mock.calls[0]?.[0].positivePrompt).toBe(
				"@Audio1 defines @Image 1's vocal timbre, pitch, and speech cadence. @Image 1 waves",
			);
		});

		describe("Kling 3 Omni", () => {
			const OMNI = "klingai:kling-video@o3-standard";
			const ELEMENT_ID = expect.stringMatching(/^[\w-]{20}$/);

			const avatar = (name: string) => `https://img/${name}.png`;
			const pictured = (...names: string[]) =>
				names.map((name) => ({ name, avatarUrl: avatar(name) }));
			const asElement = (name: string) => ({
				id: ELEMENT_ID,
				description: name,
				frontalImage: avatar(name),
				images: [avatar(name)],
			});

			const omniRequest = async (
				params: Omit<Parameters<RunwareVideo["submit"]>[0], "model">,
			) => {
				mockVideoInference.mockResolvedValue({
					taskUUID: "job-o",
					status: "processing",
				});
				await new RunwareVideo("test-key").submit({ ...params, model: OMNI });
				return mockVideoInference.mock.calls[0]?.[0];
			};

			it("casts each character as an element speaking in its voice, named by its token, with sound on", async () => {
				const request = await omniRequest({
					prompt: "{{Sol}} talks to {{Mira}}",
					characterAssets: [
						{
							name: "Sol",
							avatarUrl: avatar("Sol"),
							voice: SOL.voice,
						},
						{ name: "Mira", avatarUrl: avatar("Mira") },
					],
					width: 720,
					height: 1280,
				});

				expect(request).toEqual(
					expect.objectContaining({
						positivePrompt: "<<<element_1>>> talks to <<<element_2>>>",
						inputs: {
							elements: [
								{ ...asElement("Sol"), voices: [SOL.voice.url] },
								asElement("Mira"),
							],
						},
						providerSettings: { klingai: { sound: true } },
						width: 720,
						height: 1280,
					}),
				);
			});

			it("casts Omni Pro the same way, sized at its own 1080p default", async () => {
				mockVideoInference.mockResolvedValue({
					taskUUID: "job-op",
					status: "processing",
				});

				await new RunwareVideo("test-key").submit({
					prompt: "{{Sol}} talks",
					model: "klingai:kling-video@o3-pro",
					characterAssets: [
						{ name: "Sol", avatarUrl: avatar("Sol"), voice: SOL.voice },
					],
				});

				const request = mockVideoInference.mock.calls[0]?.[0];
				expect(request).toEqual(
					expect.objectContaining({
						positivePrompt: "<<<element_1>>> talks",
						inputs: {
							elements: [{ ...asElement("Sol"), voices: [SOL.voice.url] }],
						},
						providerSettings: { klingai: { sound: true } },
						width: 1920,
						height: 1080,
					}),
				);
				expect(request).not.toHaveProperty("resolution");
			});

			it("drops a voice under 5 s and cuts one over 30 s", async () => {
				const request = await omniRequest({
					prompt: "they talk",
					characterAssets: [
						{
							...pictured("Blip")[0],
							voice: { url: "https://audio/blip.mp3", durationSec: 4 },
						},
						{
							...pictured("Long")[0],
							voice: { url: "https://audio/long.mp3", durationSec: 40 },
						},
					],
				});

				expect(request.inputs.elements).toEqual([
					asElement("Blip"),
					{ ...asElement("Long"), voices: ["https://audio/long.mp3#30s"] },
				]);
			});

			it("leaves a character with no avatar out of the elements, naming them plainly", async () => {
				const request = await omniRequest({
					prompt: "{{Sol}} talks to {{Mira}}",
					characterAssets: [
						{ name: "Sol", voice: SOL.voice },
						...pictured("Mira"),
					],
				});

				expect(request).toMatchObject({
					positivePrompt: "Sol talks to <<<element_1>>>",
					inputs: { elements: [asElement("Mira")] },
				});
			});

			it("opens on its frame with references, and lets the frame set the size", async () => {
				const request = await omniRequest({
					prompt: "animate this",
					frameImage: "https://img/last.png",
					referenceImages: ["https://img/ref.png"],
					resolution: "720p",
					width: 1280,
					height: 720,
				});

				expect(request).toMatchObject({
					positivePrompt: "animate this",
					inputs: {
						frameImages: ["https://img/last.png"],
						referenceImages: ["https://img/ref.png"],
					},
				});
				expect(request).not.toHaveProperty("width");
				expect(request).not.toHaveProperty("height");
				expect(request).not.toHaveProperty("resolution");
			});

			it("generates from references alone, sized by pixels", async () => {
				const request = await omniRequest({
					prompt: "a sunset",
					referenceImages: ["https://img/ref.png"],
				});

				expect(request).toMatchObject({
					inputs: { referenceImages: ["https://img/ref.png"] },
					width: 1280,
					height: 720,
				});
				expect(request.inputs).not.toHaveProperty("frameImages");
			});

			const references = ["ref-1", "ref-2", "ref-3"].map(avatar);
			const continuityFrames = [avatar("first"), avatar("middle")];

			it.each([
				{
					case: "seven slots, characters first",
					frameImage: undefined,
					characterAssets: pictured("A", "B", "C", "D", "E", "F"),
					elements: ["A", "B", "C", "D", "E", "F"],
					referenceImages: [avatar("first")],
				},
				{
					case: "three elements and six slots beside a start frame, previous scene first",
					frameImage: avatar("last"),
					characterAssets: pictured("A", "B", "C", "D"),
					elements: ["A", "B", "C"],
					referenceImages: [...continuityFrames, avatar("D")],
				},
				{
					case: "the slots the characters leave, previous scene first",
					frameImage: undefined,
					characterAssets: pictured("A", "B"),
					elements: ["A", "B"],
					referenceImages: [...continuityFrames, ...references],
				},
			])(
				"budgets $case",
				async ({ frameImage, characterAssets, elements, referenceImages }) => {
					const request = await omniRequest({
						prompt: "they talk",
						frameImage,
						characterAssets,
						referenceImages: references,
						continuityFrames,
					});

					expect(request.inputs).toEqual({
						...(frameImage && { frameImages: [frameImage] }),
						elements: elements.map(asElement),
						referenceImages,
					});
				},
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
					status: "success",
					cost: 0.18,
					videoURL: "https://v.mp4",
				},
			]);

			const provider = new RunwareVideo("test-key");
			const result = await provider.submit({ prompt: "test", model: MODEL });

			expect(result).toBe("job-arr");
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

		it("disconnects on error, passing the SDK's Error through as it is", async () => {
			const failure = new Error("fail");
			mockVideoInference.mockRejectedValue(failure);

			const provider = new RunwareVideo("test-key");
			await expect(
				provider.submit({ prompt: "test", model: MODEL }),
			).rejects.toBe(failure);
			expect(mockDisconnect).toHaveBeenCalled();
		});
	});

	describe("poll", () => {
		it("stamps the completed asset with the duration that was requested", async () => {
			mockGetResponse.mockResolvedValue([
				{
					taskUUID: "job-1",
					status: "success",
					cost: 0.18,
					videoURL: "https://r.mp4",
				},
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
					status: "success",
					cost: 0.18,
					videoURL: "https://result.mp4",
				},
			]);

			const provider = new RunwareVideo("test-key");
			const result = await provider.poll("job-1", {
				prompt: "test",
				model: MODEL,
			});

			expect(upload).toHaveBeenCalledWith(
				"video",
				"runware",
				[expect.objectContaining({ key: "video", url: "https://result.mp4" })],
				expect.any(Object),
			);
			expect(result).toMatchObject({
				kind: "ready",
				asset: { result: { video: "output.mp4" } },
			});
			expect(mockDisconnect).toHaveBeenCalled();
		});

		it("keeps a job that has a url but has not succeeded out of the store", async () => {
			mockGetResponse.mockResolvedValue([
				{
					taskUUID: "job-1",
					status: "processing",
					videoURL: "https://early.mp4",
				},
			]);

			const result = await new RunwareVideo("test-key").poll("job-1", {
				prompt: "test",
				model: MODEL,
			});

			expect(result).toEqual({ kind: "pending" });
			expect(upload).not.toHaveBeenCalled();
		});

		it("keeps waiting while a finished video is still served empty", async () => {
			mockGetResponse.mockResolvedValue([
				{
					taskUUID: "job-1",
					status: "success",
					cost: 0.18,
					videoURL: "https://r.mp4",
				},
			]);
			upload.mockRejectedValueOnce(
				new EmptyRemoteFileError("video", "runware"),
			);

			const result = await new RunwareVideo("test-key").poll("job-1", {
				prompt: "test",
				model: MODEL,
			});

			expect(result).toEqual({ kind: "pending" });
		});

		it("carries the vendor's charge when a finished video cannot be stored", async () => {
			mockGetResponse.mockResolvedValue([
				{
					taskUUID: "job-1",
					status: "success",
					cost: 0.18,
					videoURL: "https://r.mp4",
				},
			]);
			upload.mockRejectedValueOnce(new Error("blob unavailable"));

			const error = await new RunwareVideo("test-key")
				.poll("job-1", { prompt: "test", model: MODEL })
				.catch((e) => e);

			expect(chargedUsd(error)).toBe(0.18);
			expect(error).toMatchObject({ message: "blob unavailable" });
		});

		it("fails a job that errored even when it carries a url", async () => {
			mockGetResponse.mockResolvedValue([
				{ taskUUID: "job-1", status: "error", videoURL: "https://bad.mp4" },
			]);

			const result = await new RunwareVideo("test-key").poll("job-1", {
				prompt: "test",
				model: MODEL,
			});

			expect(result).toEqual({ kind: "failed" });
			expect(upload).not.toHaveBeenCalled();
		});

		it("hands back what the vendor charged for the finished video", async () => {
			mockGetResponse.mockResolvedValue([
				{
					taskUUID: "job-1",
					status: "success",
					cost: 0.42,
					videoURL: "https://r.mp4",
				},
			]);

			const poll = await new RunwareVideo("test-key").poll("job-1", {
				prompt: "test",
				model: MODEL,
			});

			expect(poll.kind === "ready" && poll.costUsd).toBe(0.42);
		});

		it("still hands back the video when a finished job reports no cost", async () => {
			mockGetResponse.mockResolvedValue([
				{ taskUUID: "job-1", status: "success", videoURL: "https://r.mp4" },
			]);

			const poll = await new RunwareVideo("test-key").poll("job-1", {
				prompt: "test",
				model: MODEL,
			});

			expect(poll.kind === "ready" && poll.costUsd).toBe(0);
		});

		it("fails loudly when a job succeeded without a video", async () => {
			mockGetResponse.mockResolvedValue([
				{ taskUUID: "job-1", status: "success", cost: 0.18 },
			]);

			await expect(
				new RunwareVideo("test-key").poll("job-1", {
					prompt: "test",
					model: MODEL,
				}),
			).rejects.toThrow("completed without a video");
		});

		it("throws when job not found", async () => {
			mockGetResponse.mockResolvedValue([]);

			const provider = new RunwareVideo("test-key");
			await expect(
				provider.poll("missing", { prompt: "test", model: MODEL }),
			).rejects.toThrow("Job not found");
			expect(mockDisconnect).toHaveBeenCalled();
		});

		it("throws an Error carrying Runware's reason when the SDK rejects with its error object", async () => {
			const refusal = {
				error: { code: "contentModeration", message: "Prompt was flagged" },
			};
			mockGetResponse.mockRejectedValue(refusal);

			const outcome = new RunwareVideo("test-key").poll("job-1", {
				prompt: "test",
				model: MODEL,
			});

			await expect(outcome).rejects.toThrow("Runware: Prompt was flagged");
			await expect(outcome).rejects.toHaveProperty("cause", refusal);
			expect(mockDisconnect).toHaveBeenCalled();
		});
	});
});
