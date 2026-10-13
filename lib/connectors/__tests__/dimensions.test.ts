import { describe, expect, it } from "vitest";
import { createDimensionsPlugin } from "@/lib/connectors/plugins/dimensions";
import { createCanvasElement } from "@/lib/canvas/create-canvas-element";
import { projectState } from "@/lib/generation/__tests__/_context";
import { pluginCtx, readsOf } from "./_state-ctx";

const SEEDANCE = { provider: "runware", model: "Seedance 2 Fast" } as const;
const image = createCanvasElement("image", { id: "i1" });
const portraitState = projectState({ aspectRatio: "9:16" });
const portrait = pluginCtx({
	reads: readsOf(createDimensionsPlugin("image"), image, [], portraitState),
});

describe("createDimensionsPlugin", () => {
	it.each([
		[
			"an image from the aspect ratio alone",
			"image",
			{ resolution: "1080p" },
			{ resolution: "1080p", width: 1440, height: 2560 },
		],
		[
			"a video at the resolution it names",
			"video",
			{ resolution: "1080p" },
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

	it("records the aspect ratio, so changing it stales the result", () => {
		expect(
			readsOf(createDimensionsPlugin("image"), image, [], portraitState),
		).toEqual({ "the aspect ratio": "9:16" });
	});
});
