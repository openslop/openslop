import { describe, expect, it, vi } from "vitest";
import { GatewayClient } from "@/lib/gateway/base";
import { createCharacterAvatarStylePlugin } from "@/lib/connectors/llm/plugins/character-avatar-style";
import { createProjectStore } from "@/lib/project/store";
import { stubAvatarResults } from "./_node-results";
import { stateCtx } from "./_state-ctx";
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
			text: "A freckled girl with red braids, painterly style.",
			model: "test",
		}),
	);
}

function setup(avatars: Record<string, string> = {}) {
	const store = createProjectStore();
	const gateway = new MockLLMGateway();
	const plugin = createCharacterAvatarStylePlugin(stubAvatarResults(avatars));
	if (!plugin.transformPrompt)
		throw new Error(
			"character-avatar-style plugin must define transformPrompt",
		);
	// Built per call: tests seed the store after setup, and the plugin reads the
	// state its caller hands it.
	const ctx = (): PluginContext<LLMGenerateParams, LLMGenerateResult> => ({
		gateway,
		...stateCtx(store),
	});
	return { store, gateway, transformPrompt: plugin.transformPrompt, ctx };
}

describe("createCharacterAvatarStylePlugin", () => {
	it("returns the prompt unchanged when no character has an avatar", async () => {
		const { store, gateway, transformPrompt, ctx } = setup();
		store.getState().setCharacter("Mira", { appearance: "blue hair" });

		const result = await transformPrompt("write a scene", ctx());

		expect(result).toBe("write a scene");
		expect(gateway.generate).not.toHaveBeenCalled();
	});

	it("describes uploaded avatars from the image", async () => {
		const { store, gateway, transformPrompt, ctx } = setup({
			Mira: "https://example.com/mira.png",
		});
		store
			.getState()
			.setCharacter("Mira", { appearance: "", avatarUploaded: true });

		const result = await transformPrompt("write a scene", ctx());

		expect(gateway.generate).toHaveBeenCalledOnce();
		expect(gateway.generate.mock.calls[0][0].referenceImages).toEqual([
			"https://example.com/mira.png",
		]);
		expect(result).toContain(
			"- Mira: A freckled girl with red braids, painterly style.",
		);
		expect(result).toContain("write a scene");
	});

	it("reuses the appearance text for generated avatars without calling the gateway", async () => {
		const { store, gateway, transformPrompt, ctx } = setup({
			Mira: "https://example.com/generated.png",
		});
		store.getState().setCharacter("Mira", {
			appearance: "a tall woman with green hair",
			avatarUploaded: false,
		});

		const result = await transformPrompt("write a scene", ctx());

		expect(gateway.generate).not.toHaveBeenCalled();
		expect(result).toContain("- Mira: a tall woman with green hair");
	});

	it("preserves both generated and uploaded character appearances", async () => {
		const { store, gateway, transformPrompt, ctx } = setup({
			Generated: "https://example.com/generated.png",
			Uploaded: "https://example.com/uploaded.png",
		});
		const state = store.getState();
		state.setCharacter("Generated", {
			appearance: "a tall woman with green hair",
			avatarUploaded: false,
		});
		state.setCharacter("Uploaded", { appearance: "", avatarUploaded: true });

		const result = await transformPrompt("write a scene", ctx());

		expect(gateway.generate).toHaveBeenCalledOnce();
		expect(result).toContain("- Generated: a tall woman with green hair");
		expect(result).toContain(
			"- Uploaded: A freckled girl with red braids, painterly style.",
		);
	});

	it("throws when an uploaded avatar needs description but no gateway is provided", async () => {
		const { store, transformPrompt } = setup({
			Mira: "https://example.com/mira.png",
		});
		store
			.getState()
			.setCharacter("Mira", { appearance: "", avatarUploaded: true });

		await expect(
			transformPrompt("write a scene", stateCtx(store)),
		).rejects.toThrow("character-avatar-style plugin requires gateway context");
	});
});
