import { describe, expect, it, vi } from "vitest";

const generateMock = vi.fn();

vi.mock("../../factory", () => ({
	createConnector: () => ({ generate: generateMock }),
}));

import type { ConnectorRegistry } from "@/lib/config/ConfigProvider";
import type {
	AnimatedImageGenerateParams,
	AssetResult,
	PluginContext,
} from "../../types";
import { createVideoChainPlugin } from "../animated-image-chain";

const registry: ConnectorRegistry = {
	llm: { openslop: { defaultModel: "m", models: ["m"], isDefault: true } },
	tts: { openslop: { defaultModel: "m", models: ["m"], isDefault: true } },
	image: { openslop: { defaultModel: "m", models: ["m"], isDefault: true } },
	animated_image: {
		openslop: { defaultModel: "m", models: ["m"], isDefault: true },
	},
	video: { openslop: { defaultModel: "m", models: ["m"], isDefault: true } },
	sfx: { openslop: { defaultModel: "m", models: ["m"], isDefault: true } },
	music: { openslop: { defaultModel: "m", models: ["m"], isDefault: true } },
};

describe("createVideoChainPlugin", () => {
	it("stashes videoPrompt and animates the still via the video connector", async () => {
		generateMock.mockReset();
		generateMock.mockResolvedValue({
			url: "https://example.com/video.mp4",
			durationSec: 5,
		});

		const plugin = createVideoChainPlugin(registry);
		const ctx: PluginContext<AnimatedImageGenerateParams, AssetResult> = {};

		const cleaned = (await plugin.beforeGenerate?.(
			{ prompt: "a dark forest", videoPrompt: "slow zoom in" },
			ctx,
		)) as AnimatedImageGenerateParams;

		expect(cleaned).not.toHaveProperty("videoPrompt");
		expect(ctx.data?.videoPrompt).toBe("slow zoom in");

		const still = {
			url: "https://example.com/still.png",
			durationSec: 0,
		} satisfies AssetResult;
		const result = (await plugin.afterGenerate?.(still, ctx)) as AssetResult;

		expect(generateMock).toHaveBeenCalledWith({
			prompt: "slow zoom in",
			frameImages: ["https://example.com/still.png"],
		});
		expect(result).toEqual({
			url: "https://example.com/video.mp4",
			durationSec: 5,
			previewUrl: "https://example.com/still.png",
		});
	});

	it("passes the still result through untouched when no videoPrompt is set", async () => {
		generateMock.mockReset();
		const plugin = createVideoChainPlugin(registry);
		const ctx: PluginContext<AnimatedImageGenerateParams, AssetResult> = {};

		await plugin.beforeGenerate?.({ prompt: "a dark forest" }, ctx);

		const still = {
			url: "https://example.com/still.png",
			durationSec: 0,
		} satisfies AssetResult;
		const result = (await plugin.afterGenerate?.(still, ctx)) as AssetResult;

		expect(generateMock).not.toHaveBeenCalled();
		expect(result).toBe(still);
	});
});
