import { describe, expect, it } from "vitest";
import { createDimensionsPlugin } from "@/lib/connectors/plugins/dimensions";
import { createCanvasElement } from "@/lib/canvas/createCanvasElement";
import { pluginCtx, projectState, readsOf } from "./_state-ctx";

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
			"1080p",
			{ resolution: "1080p", width: 1440, height: 2560 },
		],
		[
			"a video at the resolution it names",
			"video",
			"1080p",
			{ resolution: "1080p", width: 1080, height: 1920 },
		],
		[
			"a video that names none at the default",
			"video",
			undefined,
			{ resolution: "720p", width: 720, height: 1280 },
		],
	] as const)("sizes %s", (_, type, resolution, size) => {
		const { beforeGenerate } = createDimensionsPlugin(type);
		const params = resolution
			? { prompt: "a cat", resolution }
			: { prompt: "a cat" };
		expect(beforeGenerate?.(params, portrait)).toEqual({
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
