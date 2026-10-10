import { describe, expect, it } from "vitest";
import { createDimensionsPlugin } from "@/lib/connectors/plugins/dimensions";
import { createCanvasElement } from "@/lib/canvas/create-canvas-element";
import { projectState } from "@/lib/generation/__tests__/_context";
import { pluginCtx, readsOf } from "./_state-ctx";

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
			"a video that names none at the default",
			"video",
			{},
			{ resolution: "720p", width: 720, height: 1280 },
		],
	] as const)("sizes %s", (_, type, named, size) => {
		const { beforeGenerate } = createDimensionsPlugin(type);
		expect(beforeGenerate?.({ prompt: "a cat", ...named }, portrait)).toEqual({
			prompt: "a cat",
			...size,
		});
	});

	it("records the aspect ratio, so changing it stales the result", () => {
		expect(
			readsOf(createDimensionsPlugin("image"), image, [], portraitState),
		).toEqual({ "the aspect ratio": "9:16" });
	});
});
