import { describe, expect, it, vi } from "vitest";
import { createCanvasElement } from "@/lib/canvas/create-canvas-element";
import { references } from "@/lib/canvas/__tests__/_assets";
import { toCaption } from "@/lib/captions/word-captions";
import type { ElementSnapshot } from "@/lib/generation/snapshots";
import { elementResult } from "../element-result";

const captureFrames = vi.hoisted(() =>
	vi.fn(async (_url: string, frames: readonly string[]) =>
		frames.map((frame) => `https://img/${frame}.jpg`),
	),
);
vi.mock("@/lib/connectors/video/capture-frames", () => ({ captureFrames }));

const snapshot = (fields: Partial<ElementSnapshot> = {}): ElementSnapshot => ({
	status: "idle",
	startedAt: null,
	result: null,
	error: null,
	resultInputs: null,
	connectorType: null,
	pinned: false,
	...fields,
});

const image = createCanvasElement("image");
const wolf = "https://example.com/wolf.jpg";

describe("elementResult", () => {
	it.each([
		[
			"a generated image",
			image,
			snapshot({ result: { imageUrl: wolf, durationSec: 0 } }),
		],
		[
			"an uploaded avatar",
			createCanvasElement("asset_avatar"),
			snapshot({ result: { imageUrl: wolf, durationSec: 0 }, pinned: true }),
		],
	] as const)("hands over %s", async (_, element, state) => {
		await expect(elementResult(element, state)).resolves.toEqual({
			ok: true,
			view: {
				durationSec: 0,
				pictures: [{ url: wolf }],
				words: [],
			},
		});
	});

	it("hands over every uploaded reference image", async () => {
		const urls = [wolf, "https://example.com/fox.jpg"];

		await expect(
			elementResult(references(...urls), snapshot()),
		).resolves.toMatchObject({
			ok: true,
			view: { pictures: urls.map((url) => ({ url })) },
		});
	});

	it("shows a video as frames with their times across its length", async () => {
		const video = createCanvasElement("video");
		const videoUrl = "https://example.com/wolf.mp4";

		await expect(
			elementResult(video, snapshot({ result: { videoUrl, durationSec: 6 } })),
		).resolves.toEqual({
			ok: true,
			view: {
				durationSec: 6,
				pictures: [
					{ url: "https://img/first.jpg", at: 0 },
					{ url: "https://img/middle.jpg", at: 3 },
					{ url: "https://img/last.jpg", at: 6 },
				],
				words: [],
			},
		});
		expect(captureFrames).toHaveBeenCalledWith(videoUrl, expect.anything());
	});

	it.each([
		[
			"a voice line with every word and when it is said",
			createCanvasElement("narration"),
			[toCaption("hello", 0, 0.4), toCaption("there", 0.5, 1.1)],
		],
		["music with no words", createCanvasElement("music"), undefined],
	] as const)("shows %s as its length", async (_, element, words) => {
		await expect(
			elementResult(
				element,
				snapshot({
					result: {
						audioUrl: "https://example.com/sound.mp3",
						durationSec: 1.2,
						textTimestamps: words && [...words],
					},
				}),
			),
		).resolves.toEqual({
			ok: true,
			view: {
				durationSec: 1.2,
				pictures: [],
				words: words ?? [],
			},
		});
	});

	it.each([
		["an image not drawn yet", image, snapshot(), "has not been generated yet"],
		[
			"an image still generating",
			image,
			snapshot({ status: "generating" }),
			"is still generating",
		],
		[
			"an image whose generation failed, with the failure's words",
			image,
			snapshot({ error: "The provider rejected this key." }),
			"failed to generate: The provider rejected this key.",
		],
		[
			"an upload holding nothing",
			image,
			snapshot({ result: { durationSec: 0 }, pinned: true }),
			"has an empty upload",
		],
		[
			"reference images never uploaded",
			references(),
			snapshot(),
			"has no reference images uploaded",
		],
		[
			"an asset that generates nothing",
			createCanvasElement("asset_style"),
			snapshot(),
			"is of type asset_style, which generates nothing",
		],
	] as const)("explains %s", async (_, element, state, reason) => {
		await expect(elementResult(element, state)).resolves.toEqual({
			ok: false,
			reason,
		});
	});
});
