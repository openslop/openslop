import { describe, expect, it, vi } from "vitest";
import { GatewayClient } from "@/lib/gateway/base";
import { createCharacterAvatarStylePlugin } from "@/lib/connectors/llm/plugins/character-avatar-style";
import { clearProjectStore, getProjectStore } from "@/lib/project/store";
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

function setup(projectId: string) {
	clearProjectStore(projectId);
	const gateway = new MockLLMGateway();
	const plugin = createCharacterAvatarStylePlugin(projectId);
	if (!plugin.transformPrompt)
		throw new Error(
			"character-avatar-style plugin must define transformPrompt",
		);
	const ctx: PluginContext<LLMGenerateParams, LLMGenerateResult> = { gateway };
	return { gateway, transformPrompt: plugin.transformPrompt, ctx };
}

describe("createCharacterAvatarStylePlugin", () => {
	it("returns the prompt unchanged when no character has an avatar", async () => {
		const { gateway, transformPrompt, ctx } = setup("c1");
		getProjectStore("c1")
			.getState()
			.setCharacter("Mira", { appearance: "blue hair" });

		const result = await transformPrompt("write a scene", ctx);

		expect(result).toBe("write a scene");
		expect(gateway.generate).not.toHaveBeenCalled();
	});

	it("describes uploaded avatars from the image", async () => {
		const { gateway, transformPrompt, ctx } = setup("c2");
		getProjectStore("c2").getState().setCharacter("Mira", {
			appearance: "",
			avatarUrl: "https://example.com/mira.png",
			avatarUploaded: true,
		});

		const result = await transformPrompt("write a scene", ctx);

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
		const { gateway, transformPrompt, ctx } = setup("c3");
		getProjectStore("c3").getState().setCharacter("Mira", {
			appearance: "a tall woman with green hair",
			avatarUrl: "https://example.com/generated.png",
			avatarUploaded: false,
		});

		const result = await transformPrompt("write a scene", ctx);

		expect(gateway.generate).not.toHaveBeenCalled();
		expect(result).toContain("- Mira: a tall woman with green hair");
	});

	it("preserves both generated and uploaded character appearances", async () => {
		const { gateway, transformPrompt, ctx } = setup("c4");
		const store = getProjectStore("c4").getState();
		store.setCharacter("Generated", {
			appearance: "a tall woman with green hair",
			avatarUrl: "https://example.com/generated.png",
			avatarUploaded: false,
		});
		store.setCharacter("Uploaded", {
			appearance: "",
			avatarUrl: "https://example.com/uploaded.png",
			avatarUploaded: true,
		});

		const result = await transformPrompt("write a scene", ctx);

		expect(gateway.generate).toHaveBeenCalledOnce();
		expect(result).toContain("- Generated: a tall woman with green hair");
		expect(result).toContain(
			"- Uploaded: A freckled girl with red braids, painterly style.",
		);
	});

	it("throws when an uploaded avatar needs description but no gateway is provided", async () => {
		const { transformPrompt } = setup("c5");
		getProjectStore("c5").getState().setCharacter("Mira", {
			appearance: "",
			avatarUrl: "https://example.com/mira.png",
			avatarUploaded: true,
		});

		await expect(transformPrompt("write a scene")).rejects.toThrow(
			"character-avatar-style plugin requires gateway context",
		);
	});
});
