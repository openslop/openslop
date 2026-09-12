import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CanvasContentElement } from "@/lib/canvas/types";
import { MetadataSchema } from "@/lib/project/types";
import {
	createStartFramePlugin,
	type ParamsWithStartFrame,
} from "../video/plugins/start-frame";
import type { AssetResult, ConnectorPlugin } from "../types";

const captureLastFrame = vi.hoisted(() =>
	vi.fn<(url: string) => Promise<string>>(),
);
vi.mock("@/lib/connectors/video/captureLastFrame", () => ({
	captureLastFrame,
}));

const EMPTY_STATE = { metadata: MetadataSchema.parse({}), referenceImages: [] };

const video = (startFrame?: string): CanvasContentElement => ({
	id: "video-1",
	type: "video",
	generationAttributes: startFrame ? { startFrame } : {},
	children: [{ id: "t", type: "video", text: "slow pan" }],
});

const image: CanvasContentElement = {
	id: "img-1",
	type: "image",
	children: [{ id: "t", type: "image", text: "a sunset" }],
};

describe("start-frame plugin", () => {
	let plugin: ConnectorPlugin<ParamsWithStartFrame>;

	const before = (
		params: ParamsWithStartFrame,
		dependencies: Record<string, AssetResult> = {},
		canvas: CanvasContentElement[] = [image, video("previous")],
	) => {
		if (!plugin.beforeGenerate) throw new Error("no beforeGenerate");
		return plugin.beforeGenerate(params, {
			elementId: "video-1",
			dependencies,
			canvas,
		});
	};

	beforeEach(() => {
		plugin = createStartFramePlugin();
		captureLastFrame.mockReset();
	});

	describe("dependencies", () => {
		it("declares none without a start frame, or with a picture by URL", () => {
			expect(plugin.dependencies?.(video())).toEqual([]);
			expect(plugin.dependencies?.(video("https://img/a.png"))).toEqual([]);
		});

		it("declares the visual before the video, by document order", () => {
			const [spec] = plugin.dependencies?.(video("previous")) ?? [];
			const declared = spec?.({
				state: EMPTY_STATE,
				canvas: () => [image, video("previous")],
			});
			expect(declared).toEqual({ element: image, label: "the start frame" });
		});

		it("declares an empty leaf when nothing comes before the video", () => {
			const [spec] = plugin.dependencies?.(video("previous")) ?? [];
			const declared = spec?.({
				state: EMPTY_STATE,
				canvas: () => [video("previous"), image],
			});
			expect(declared).toMatchObject({ job: null });
		});

		it("declares a source named by id, and keeps a deleted one as an orphan", () => {
			const [spec] = plugin.dependencies?.(video("img-1")) ?? [];
			expect(spec?.({ state: EMPTY_STATE, canvas: () => [image] })).toEqual({
				element: image,
				label: "the start frame",
			});
			expect(spec?.({ state: EMPTY_STATE, canvas: () => [] })).toMatchObject({
				id: "img-1",
				job: null,
			});
		});
	});

	describe("beforeGenerate", () => {
		it("leaves a video with no start frame alone", async () => {
			await expect(before({ prompt: "slow pan" })).resolves.toEqual({
				prompt: "slow pan",
			});
		});

		it("opens on a picture by URL without a dependency", async () => {
			await expect(
				before({ prompt: "slow pan", startFrame: "https://img/a.png" }),
			).resolves.toEqual({
				prompt: "slow pan",
				frameImages: ["https://img/a.png"],
			});
		});

		it("opens on the picture of the visual before it", async () => {
			await expect(
				before(
					{ prompt: "slow pan", startFrame: "previous" },
					{ "img-1": { imageUrl: "https://img/sunset.png", durationSec: 0 } },
				),
			).resolves.toEqual({
				prompt: "slow pan",
				frameImages: ["https://img/sunset.png"],
			});
		});

		it("opens on nothing when no visual comes before it", async () => {
			await expect(
				before({ prompt: "slow pan", startFrame: "previous" }, {}, [
					video("previous"),
					image,
				]),
			).resolves.toEqual({ prompt: "slow pan" });
		});

		it("opens on an image source's picture", async () => {
			await expect(
				before(
					{ prompt: "slow pan", startFrame: "img-1" },
					{ "img-1": { imageUrl: "https://img/sunset.png", durationSec: 0 } },
				),
			).resolves.toEqual({
				prompt: "slow pan",
				frameImages: ["https://img/sunset.png"],
			});
		});

		it("opens on the last frame of a video source's generated file", async () => {
			captureLastFrame.mockResolvedValue("https://img/last.png");
			await expect(
				before(
					{ prompt: "slow pan", startFrame: "video-0" },
					{
						"video-0": {
							imageUrl: "https://img/first.png",
							videoUrl: "https://vid/a.mp4",
							durationSec: 5,
						},
					},
				),
			).resolves.toEqual({
				prompt: "slow pan",
				frameImages: ["https://img/last.png"],
			});
			expect(captureLastFrame).toHaveBeenCalledWith("https://vid/a.mp4");
		});

		it("fails loudly when the source has not generated", async () => {
			await expect(
				before({ prompt: "slow pan", startFrame: "img-1" }),
			).rejects.toThrow(/has not generated/);
		});

		it("fails loudly when the source made no picture", async () => {
			await expect(
				before(
					{ prompt: "slow pan", startFrame: "nar-1" },
					{ "nar-1": { audioUrl: "https://a/x.mp3", durationSec: 3 } },
				),
			).rejects.toThrow(/no picture/);
		});
	});
});
