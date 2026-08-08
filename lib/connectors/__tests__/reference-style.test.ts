import { describe, expect, it, vi } from "vitest";
import { GatewayClient } from "@/lib/gateway/base";
import { createReferenceStylePlugin } from "@/lib/connectors/llm/plugins/reference-style";
import { stubAvatarResults } from "./_node-results";
import { stateCtx } from "./_state-ctx";
import { createProjectStore } from "@/lib/project/store";
import type {
	LLMGenerateParams,
	LLMGenerateResult,
	PluginContext,
} from "../types";

class MockLLMGateway extends GatewayClient<
	LLMGenerateParams,
	LLMGenerateResult
> {
	generate = vi.fn(
		async (_params: LLMGenerateParams): Promise<LLMGenerateResult> => ({
			text: "Soft watercolor, pastel palette, dreamy lighting.",
			model: "test",
		}),
	);
}

function setup(
	referenceImages: string[],
	avatars: Record<string, string> = {},
) {
	const store = createProjectStore();
	store.getState().setReferenceImages(referenceImages);
	const gateway = new MockLLMGateway();
	const plugin = createReferenceStylePlugin(stubAvatarResults(avatars));
	if (!plugin.transformPrompt)
		throw new Error("reference-style plugin must define transformPrompt");
	// Built per call: tests seed the store after setup, and the plugin reads the
	// state its caller hands it.
	const ctx = (): PluginContext<LLMGenerateParams, LLMGenerateResult> => ({
		gateway,
		...stateCtx(store),
	});
	return { store, gateway, transformPrompt: plugin.transformPrompt, ctx };
}

describe("createReferenceStylePlugin", () => {
	it("returns the prompt unchanged and skips gateway when no images are present", async () => {
		const { gateway, transformPrompt, ctx } = setup([]);
		const result = await transformPrompt("a knight and a dragon", ctx());
		expect(result).toBe("a knight and a dragon");
		expect(gateway.generate).not.toHaveBeenCalled();
	});

	it("calls the gateway with the reference images and prepends the style description", async () => {
		const images = ["https://example.com/a.jpg", "https://example.com/b.jpg"];
		const { gateway, transformPrompt, ctx } = setup(images);

		const result = await transformPrompt("a knight and a dragon", ctx());

		expect(gateway.generate).toHaveBeenCalledOnce();
		const call = gateway.generate.mock.calls[0][0];
		expect(call.referenceImages).toEqual(images);
		expect(call.prompt).toMatch(/describe the visual art style/i);
		expect(result).toMatch(
			/^Art style reference: Soft watercolor, pastel palette, dreamy lighting\./,
		);
		expect(result).toContain("a knight and a dragon");
	});

	it("combines reference images with uploaded avatars but excludes generated ones", async () => {
		const referenceImage = "https://example.com/reference.jpg";
		const uploadedAvatar = "https://example.com/uploaded-avatar.jpg";
		const generatedAvatar = "https://example.com/generated-avatar.jpg";
		const { store, gateway, transformPrompt, ctx } = setup([referenceImage], {
			Mira: uploadedAvatar,
			Generated: generatedAvatar,
		});
		store
			.getState()
			.setCharacter("Mira", { appearance: "blue hair", avatarUploaded: true });
		store.getState().setCharacter("Generated", {
			appearance: "green hair",
			avatarUploaded: false,
		});

		const result = await transformPrompt("a knight and a dragon", ctx());

		expect(gateway.generate).toHaveBeenCalledOnce();
		expect(gateway.generate.mock.calls[0][0].referenceImages).toEqual([
			referenceImage,
			uploadedAvatar,
		]);
		expect(result).toMatch(
			/^Art style reference: Soft watercolor, pastel palette, dreamy lighting\./,
		);
	});

	it("uses uploaded character avatars as style references when no reference images are present", async () => {
		const avatar = "https://example.com/avatar.jpg";
		const { store, gateway, transformPrompt, ctx } = setup([], {
			Mira: avatar,
		});
		store
			.getState()
			.setCharacter("Mira", { appearance: "blue hair", avatarUploaded: true });

		await transformPrompt("a knight and a dragon", ctx());

		expect(gateway.generate).toHaveBeenCalledOnce();
		expect(gateway.generate.mock.calls[0][0].referenceImages).toEqual([avatar]);
	});

	it("ignores generated avatars to avoid circular style references", async () => {
		const { store, gateway, transformPrompt, ctx } = setup([], {
			Generated: "https://example.com/generated-avatar.jpg",
		});
		store.getState().setCharacter("Generated", {
			appearance: "green hair",
			avatarUploaded: false,
		});

		const result = await transformPrompt("a knight and a dragon", ctx());

		expect(result).toBe("a knight and a dragon");
		expect(gateway.generate).not.toHaveBeenCalled();
	});

	it("throws when no gateway is provided", async () => {
		const { store, transformPrompt } = setup(["https://example.com/a.jpg"]);
		await expect(transformPrompt("hi", stateCtx(store))).rejects.toThrow(
			"reference-style plugin requires gateway context",
		);
	});
});
