import { describe, expect, it, vi } from "vitest";

const generateMock = vi.fn();

vi.mock("@/lib/connectors/factory", () => ({
	createConnector: () => ({ generate: generateMock }),
}));

import type { ConnectorRegistry } from "@/lib/config/ConfigProvider";
import type {
	AnimatedImageGenerateParams,
	AssetResult,
	PluginContext,
} from "@/lib/connectors/types";
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
			videoUrl: "https://example.com/video.mp4",
			durationSec: 5,
		});

		const plugin = createVideoChainPlugin(registry);
		const ctx: PluginContext<AnimatedImageGenerateParams, AssetResult> = {};

		const cleaned = (await plugin.beforeGenerate?.(
			{
				prompt: "a dark forest",
				videoPrompt: "slow zoom in",
				videoWidth: 1280,
				videoHeight: 720,
				duration: 8,
			},
			ctx,
		)) as AnimatedImageGenerateParams;

		expect(cleaned).not.toHaveProperty("videoPrompt");
		expect(cleaned).not.toHaveProperty("videoWidth");
		expect(cleaned).not.toHaveProperty("videoHeight");
		expect(cleaned).not.toHaveProperty("duration");

		const still = {
			imageUrl: "https://example.com/still.png",
			durationSec: 0,
		} satisfies AssetResult;
		const result = (await plugin.afterGenerate?.(still, ctx)) as AssetResult;

		expect(generateMock).toHaveBeenCalledWith({
			prompt: "slow zoom in",
			frameImages: ["https://example.com/still.png"],
			width: 1280,
			height: 720,
			duration: 8,
		});
		expect(result).toEqual({
			imageUrl: "https://example.com/still.png",
			videoUrl: "https://example.com/video.mp4",
			durationSec: 5,
		});
	});

	it("translates a frameImages provider error into a human-readable message, keeping the raw detail as cause", async () => {
		generateMock.mockReset();
		const providerError = {
			error: {
				code: "invalidValueUploadFailed",
				message: "Processing parameter 'inputs.frameImages' failed.",
				parameter: "inputs.frameImages",
				taskUUID: "abc-123",
			},
		};
		generateMock.mockRejectedValue(providerError);

		const plugin = createVideoChainPlugin(registry);
		const ctx: PluginContext<AnimatedImageGenerateParams, AssetResult> = {};
		await plugin.beforeGenerate?.(
			{ prompt: "a dark forest", videoPrompt: "slow zoom in" },
			ctx,
		);

		const still = {
			imageUrl: "https://example.com/still.png",
			durationSec: 0,
		} satisfies AssetResult;

		await expect(plugin.afterGenerate?.(still, ctx)).rejects.toThrow(
			"Couldn't animate: the source image failed to generate. Try regenerating the image.",
		);

		try {
			await plugin.afterGenerate?.(still, ctx);
			expect.unreachable();
		} catch (err) {
			expect((err as Error).cause).toEqual(providerError);
			// The raw provider detail must not leak into the user-facing message —
			// the UI renders it verbatim.
			expect((err as Error).message).not.toContain("invalidValueUploadFailed");
		}
	});

	it("does not rewrite an unrelated video-provider error", async () => {
		generateMock.mockReset();
		generateMock.mockRejectedValue(new Error("Runware: rate limit exceeded"));

		const plugin = createVideoChainPlugin(registry);
		const ctx: PluginContext<AnimatedImageGenerateParams, AssetResult> = {};
		await plugin.beforeGenerate?.(
			{ prompt: "a dark forest", videoPrompt: "slow zoom in" },
			ctx,
		);

		const still = {
			imageUrl: "https://example.com/still.png",
			durationSec: 0,
		} satisfies AssetResult;

		await expect(plugin.afterGenerate?.(still, ctx)).rejects.toThrow(
			"Runware: rate limit exceeded",
		);
	});

	it("throws when videoPrompt is missing so the still URL never leaks into video rendering", async () => {
		generateMock.mockReset();
		const plugin = createVideoChainPlugin(registry);
		const ctx: PluginContext<AnimatedImageGenerateParams, AssetResult> = {};

		await plugin.beforeGenerate?.({ prompt: "a dark forest" }, ctx);

		const still = {
			imageUrl: "https://example.com/still.png",
			durationSec: 0,
		} satisfies AssetResult;

		await expect(plugin.afterGenerate?.(still, ctx)).rejects.toThrow(
			/videoPrompt/,
		);
		expect(generateMock).not.toHaveBeenCalled();
	});
});
