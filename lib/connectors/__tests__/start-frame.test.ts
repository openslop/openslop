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
vi.mock("@/lib/video/captureLastFrame", () => ({ captureLastFrame }));

const EMPTY_STATE = { metadata: MetadataSchema.parse({}), referenceImages: [] };

const clip = (startFrame?: string): CanvasContentElement => ({
	id: "clip-1",
	type: "clip",
	generationAttributes: startFrame ? { startFrame } : {},
	children: [{ id: "t", type: "clip", text: "slow pan" }],
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
		canvas: CanvasContentElement[] = [image, clip("previous")],
	) => {
		if (!plugin.beforeGenerate) throw new Error("no beforeGenerate");
		return plugin.beforeGenerate(params, {
			elementId: "clip-1",
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
			expect(plugin.dependencies?.(clip())).toEqual([]);
			expect(plugin.dependencies?.(clip("https://img/a.png"))).toEqual([]);
		});

		it("declares the visual before the clip, by document order", () => {
			const [spec] = plugin.dependencies?.(clip("previous")) ?? [];
			const declared = spec?.({
				state: EMPTY_STATE,
				canvas: () => [image, clip("previous")],
			});
			expect(declared).toEqual({ element: image, label: "the start frame" });
		});

		it("declares an empty leaf when nothing comes before the clip", () => {
			const [spec] = plugin.dependencies?.(clip("previous")) ?? [];
			const declared = spec?.({
				state: EMPTY_STATE,
				canvas: () => [clip("previous"), image],
			});
			expect(declared).toMatchObject({ job: null });
		});

		it("declares a source named by id, and keeps a deleted one as an orphan", () => {
			const [spec] = plugin.dependencies?.(clip("img-1")) ?? [];
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
		it("leaves a clip with no start frame alone", async () => {
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
					clip("previous"),
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

		it("opens on a clip source's last frame, captured from its video", async () => {
			captureLastFrame.mockResolvedValue("https://img/last.png");
			await expect(
				before(
					{ prompt: "slow pan", startFrame: "clip-0" },
					{
						"clip-0": {
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
