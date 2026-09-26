import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CanvasContentElement } from "@/lib/canvas/types";
import { DEFAULT_CONNECTOR_REGISTRY } from "@/lib/connectors/registry";
import type { BuildContext } from "@/lib/generation/graph";
import { MetadataSchema } from "@/lib/project/types";
import {
	createPreviousVisualPlugin,
	previousVisualDependency,
	type ParamsWithPreviousVisual,
} from "../video/plugins/previous-visual";
import type { AssetResult, ConnectorPlugin } from "../types";

const captureFrames = vi.hoisted(() =>
	vi.fn(async (_url: string, frames: readonly string[]) =>
		frames.map((frame) => `https://img/${frame}.png`),
	),
);
vi.mock("@/lib/connectors/video/captureFrames", () => ({
	captureFrames,
}));

const EMPTY_STATE = { metadata: MetadataSchema.parse({}), referenceImages: [] };
const context = (canvas: CanvasContentElement[]): BuildContext => ({
	state: EMPTY_STATE,
	canvas,
	registry: DEFAULT_CONNECTOR_REGISTRY,
});

const declaredOn = (
	element: CanvasContentElement,
	canvas: CanvasContentElement[],
) => previousVisualDependency.specs(element)[0]?.[1](context(canvas));

const video = (attrs: Record<string, string> = {}): CanvasContentElement => ({
	id: "video-1",
	type: "video",
	generationAttributes: attrs,
	children: [{ id: "t", type: "video", text: "slow pan" }],
});

const image: CanvasContentElement = {
	id: "img-1",
	type: "image",
	children: [{ id: "t", type: "image", text: "a sunset" }],
};

const PREVIOUS_VIDEO_RESULT: Record<string, AssetResult> = {
	previousVisual: {
		imageUrl: "https://img/poster.png",
		videoUrl: "https://vid/a.mp4",
		durationSec: 5,
	},
};

const PREVIOUS_IMAGE_RESULT: Record<string, AssetResult> = {
	previousVisual: { imageUrl: "https://img/sunset.png", durationSec: 0 },
};

describe("previous-visual plugin", () => {
	let plugin: ConnectorPlugin<ParamsWithPreviousVisual>;

	const before = (
		params: ParamsWithPreviousVisual,
		dependencies: Record<string, AssetResult> = {},
	) => {
		if (!plugin.beforeGenerate) throw new Error("no beforeGenerate");
		return plugin.beforeGenerate(params, { dependencies });
	};

	const afterVideo = (params: ParamsWithPreviousVisual) =>
		before(params, PREVIOUS_VIDEO_RESULT);

	beforeEach(() => {
		plugin = createPreviousVisualPlugin();
		captureFrames.mockClear();
	});

	describe("dependencies", () => {
		it("declares none when unlinked without a previous start frame", () => {
			expect(previousVisualDependency.specs(video())).toEqual([]);
			expect(
				previousVisualDependency.specs(video({ continuity: "false" })),
			).toEqual([]);
			expect(
				previousVisualDependency.specs(
					video({ startFrame: "https://img/a.png" }),
				),
			).toEqual([]);
		});

		it.each<Record<string, string>>([
			{ startFrame: "previous" },
			{ continuity: "true" },
		])(
			"declares the visual before the video, by document order, for %o",
			(attrs) => {
				expect(declaredOn(video(attrs), [image, video(attrs)])).toEqual({
					element: image,
					label: "the previous visual",
				});
			},
		);

		it("declares an empty leaf when nothing comes before the video", () => {
			expect(
				declaredOn(video({ startFrame: "previous" }), [video(), image]),
			).toMatchObject({ job: null });
		});
	});

	describe("beforeGenerate", () => {
		it("leaves an unlinked video with no start frame alone", async () => {
			await expect(
				before({ prompt: "slow pan", continuity: "false" }),
			).resolves.toEqual({ prompt: "slow pan" });
		});

		it("opens on a picture by URL without a dependency", async () => {
			await expect(
				before({ prompt: "slow pan", startFrame: "https://img/a.png" }),
			).resolves.toEqual({
				prompt: "slow pan",
				frameImage: "https://img/a.png",
			});
		});

		it("opens on the picture of the visual before it", async () => {
			await expect(
				before(
					{ prompt: "slow pan", startFrame: "previous" },
					PREVIOUS_IMAGE_RESULT,
				),
			).resolves.toEqual({
				prompt: "slow pan",
				frameImage: "https://img/sunset.png",
			});
		});

		it("references the image before it when linked", async () => {
			await expect(
				before(
					{ prompt: "slow pan", continuity: "true" },
					PREVIOUS_IMAGE_RESULT,
				),
			).resolves.toEqual({
				prompt: "slow pan",
				referenceImages: ["https://img/sunset.png"],
			});
		});

		it("hands on nothing when no visual comes before it", async () => {
			await expect(
				before({
					prompt: "slow pan",
					startFrame: "previous",
					continuity: "true",
				}),
			).resolves.toEqual({ prompt: "slow pan" });
		});

		it("opens on a previous video's end alone", async () => {
			await expect(
				afterVideo({ prompt: "slow pan", startFrame: "previous" }),
			).resolves.toEqual({
				prompt: "slow pan",
				frameImage: "https://img/last.png",
			});
			expect(captureFrames).toHaveBeenCalledWith("https://vid/a.mp4", ["last"]);
		});

		it("adds a previous video's beginning and middle after the reference images when linked", async () => {
			await expect(
				afterVideo({
					prompt: "slow pan",
					continuity: "true",
					referenceImages: ["https://img/avatar.png"],
				}),
			).resolves.toEqual({
				prompt: "slow pan",
				referenceImages: [
					"https://img/avatar.png",
					"https://img/first.png",
					"https://img/middle.png",
				],
			});
		});

		it("opens on the end and references the beginning and middle when linked", async () => {
			await expect(
				afterVideo({
					prompt: "slow pan",
					startFrame: "previous",
					continuity: "true",
				}),
			).resolves.toEqual({
				prompt: "slow pan",
				frameImage: "https://img/last.png",
				referenceImages: ["https://img/first.png", "https://img/middle.png"],
			});
		});

		it("references the beginning and middle while opening on an uploaded picture", async () => {
			await expect(
				afterVideo({
					prompt: "slow pan",
					startFrame: "https://img/a.png",
					continuity: "true",
				}),
			).resolves.toEqual({
				prompt: "slow pan",
				frameImage: "https://img/a.png",
				referenceImages: ["https://img/first.png", "https://img/middle.png"],
			});
		});

		it("fails loudly when the previous visual made no picture", async () => {
			await expect(
				before(
					{ prompt: "slow pan", startFrame: "previous" },
					{ previousVisual: { audioUrl: "https://a/x.mp3", durationSec: 3 } },
				),
			).rejects.toThrow(/no picture/);
		});
	});
});
