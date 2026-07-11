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

// What video.generate() actually throws in production: asset-base.ts's
// generic job-status pipeline, carrying the provider's raw error as `cause`.
function providerFailure(message: string, cause?: unknown): Error {
	return new Error(message, { cause });
}

async function runChain(rejection: Error) {
	generateMock.mockReset();
	generateMock.mockRejectedValue(rejection);

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

	return plugin.afterGenerate?.(still, ctx);
}

const FRIENDLY_MESSAGE =
	"Couldn't animate: the video provider couldn't use the still image. Try regenerating the image.";

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

	it("translates a frame-image failure into a human-readable message, keeping the raw detail as cause", async () => {
		const cause = {
			error: {
				code: "invalidValueUploadFailed",
				message: "Processing parameter 'inputs.frameImages' failed.",
				parameter: "inputs.frameImages",
				taskUUID: "abc-123",
			},
		};
		const rejection = providerFailure("Upload failed", cause);

		await expect(runChain(rejection)).rejects.toThrow(FRIENDLY_MESSAGE);

		try {
			await runChain(rejection);
			expect.unreachable();
		} catch (err) {
			// The original provider error is preserved wholesale on `cause` — its
			// own `.cause` still carries the raw structured payload for logging.
			expect((err as Error).cause).toBe(rejection);
			expect((rejection.cause as { error: unknown }).error).toBe(cause.error);
			expect((err as Error).message).not.toContain("invalidValueUploadFailed");
		}
	});

	it("translates on a matching parameter alone, regardless of code", async () => {
		const cause = { code: "someOtherCode", parameter: "inputs.frameImages" };
		await expect(
			runChain(providerFailure("Upload failed", cause)),
		).rejects.toThrow(FRIENDLY_MESSAGE);
	});

	it("translates on a matching code alone, regardless of parameter", async () => {
		const cause = {
			code: "invalidValueUploadFailed",
			parameter: "inputs.someOtherField",
		};
		await expect(
			runChain(providerFailure("Upload failed", cause)),
		).rejects.toThrow(FRIENDLY_MESSAGE);
	});

	it("translates an {errors: [...]} batch payload, mirroring the provider's isApiError", async () => {
		const cause = {
			errors: [
				{ code: "invalidValueUploadFailed", parameter: "inputs.frameImages" },
			],
		};
		await expect(
			runChain(providerFailure("Upload failed", cause)),
		).rejects.toThrow(FRIENDLY_MESSAGE);
	});

	it("does not rewrite an unrelated video-provider error", async () => {
		const rejection = providerFailure("Runware: rate limit exceeded", {
			code: "rateLimitExceeded",
			parameter: "apiKey",
		});

		await expect(runChain(rejection)).rejects.toBe(rejection);
	});

	it("does not rewrite when the error has no cause at all (e.g. a connection failure)", async () => {
		const rejection = providerFailure("WebSocket disconnected");
		await expect(runChain(rejection)).rejects.toBe(rejection);
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
