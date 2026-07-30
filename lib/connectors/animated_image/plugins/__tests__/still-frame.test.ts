import { describe, expect, it } from "vitest";
import type {
	AnimatedImageGenerateParams,
	AssetResult,
	PluginContext,
} from "@/lib/connectors/types";
import { createStillFramePlugin, stillElementId } from "../still-frame";

const ELEMENT_ID = "anim-1";
const STILL_URL = "https://example.com/still.png";

const ctx = (
	imageUrl?: string,
): PluginContext<AnimatedImageGenerateParams, AssetResult> => ({
	elementId: ELEMENT_ID,
	dependencies: imageUrl
		? { [stillElementId(ELEMENT_ID)]: { imageUrl, durationSec: 0 } }
		: {},
});

describe("still-frame plugin", () => {
	const plugin = createStillFramePlugin();

	it("animates the still frame using the motion prompt", async () => {
		const params = await plugin.beforeGenerate?.(
			{ prompt: "a dark forest", videoPrompt: "slow zoom in", duration: 8 },
			ctx(STILL_URL),
		);

		// The element's own text prompts the still, not the animation.
		expect(params).toEqual({
			prompt: "slow zoom in",
			frameImages: [STILL_URL],
			duration: 8,
		});
	});

	it("keeps the still on the result as the poster frame", async () => {
		const result = await plugin.afterGenerate?.(
			{ videoUrl: "https://example.com/v.mp4", durationSec: 5 },
			ctx(STILL_URL),
		);

		expect(result).toEqual({
			videoUrl: "https://example.com/v.mp4",
			durationSec: 5,
			imageUrl: STILL_URL,
		});
	});

	it("throws when videoPrompt is missing", () => {
		expect(() =>
			plugin.beforeGenerate?.({ prompt: "a dark forest" }, ctx(STILL_URL)),
		).toThrow(/videoPrompt/);
	});

	it("throws when the still dependency produced no frame", () => {
		expect(() =>
			plugin.beforeGenerate?.(
				{ prompt: "a dark forest", videoPrompt: "slow zoom in" },
				ctx(),
			),
		).toThrow(/still frame/);
	});
});
