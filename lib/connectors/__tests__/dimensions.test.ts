import { describe, expect, it } from "vitest";
import { createDimensionsPlugin } from "@/lib/connectors/plugins/dimensions";
import { createCanvasElement } from "@/lib/canvas/create-canvas-element";
import { projectSettings } from "@/lib/generation/__tests__/_context";
import { pluginCtx, readsOf } from "./_state-ctx";

const SEEDANCE = { provider: "runware", model: "Seedance 2 Fast" } as const;
const SLOP_IMAGE = { provider: "openslop", model: "Slop Image v2" } as const;
const image = createCanvasElement("image", { id: "i1" });
const portraitState = projectSettings({ aspectRatio: "9:16" });
const portrait = pluginCtx({
	reads: readsOf(createDimensionsPlugin("image"), image, [], portraitState),
});

describe("createDimensionsPlugin", () => {
	it.each([
		[
			"an image that names none at its model's default",
			"image",
			SLOP_IMAGE,
			{ resolution: "1152p", width: 1152, height: 2048 },
		],
		[
			"another image model at its own default",
			"image",
			{ provider: "openslop", model: "Slop Image v1" },
			{ resolution: "1440p", width: 1440, height: 2560 },
		],
		[
			"a video at the resolution it names",
			"video",
			{ model: "Seedance 2.5", resolution: "1080p" },
			{ resolution: "1080p", width: 1080, height: 1920 },
		],
		[
			"a video that names none at its model's default",
			"video",
			{},
			{ resolution: "720p", width: 720, height: 1280 },
		],
		[
			"a 1080p-only video that names none at 1080p",
			"video",
			{ model: "Kling 3 Omni Pro" },
			{ resolution: "1080p", width: 1080, height: 1920 },
		],
	] as const)("sizes %s", (_, type, named, size) => {
		const { beforeGenerate } = createDimensionsPlugin(type);
		const params = { ...SEEDANCE, prompt: "a cat", ...named };
		expect(beforeGenerate?.(params, portrait)).toEqual({ ...params, ...size });
	});

	it("fails on a resolution the model cannot render", () => {
		const { beforeGenerate } = createDimensionsPlugin("image");

		expect(() =>
			beforeGenerate?.(
				{ ...SLOP_IMAGE, prompt: "a cat", resolution: "1440p" },
				portrait,
			),
		).toThrow("meta:muse@image cannot render 1440p");
	});

	it("records the aspect ratio, so changing it stales the result", () => {
		expect(
			readsOf(createDimensionsPlugin("image"), image, [], portraitState),
		).toEqual({ "the aspect ratio": "9:16" });
	});
});
