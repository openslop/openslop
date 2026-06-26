import { afterEach, describe, expect, it, vi } from "vitest";
import { clearProjectStore, getProjectStore } from "@/lib/project/store";
import type {
	LLMGenerateParams,
	LLMGenerateResult,
	PluginContext,
} from "@/lib/connectors/types";
import type { GatewayClient } from "@/lib/gateway/base";
import type { MetadataCharacter } from "@/lib/project/types";
import { createCharacterAvatarStylePlugin } from "../character-avatar-style";

const PROJECT_ID = "avatar-style-test";

afterEach(() => clearProjectStore(PROJECT_ID));

function setCharacter(name: string, character: Partial<MetadataCharacter>) {
	getProjectStore(PROJECT_ID)
		.getState()
		.setCharacter(name, character as MetadataCharacter);
}

function gatewayContext(
	text: string,
): PluginContext<LLMGenerateParams, LLMGenerateResult> {
	const generate = vi.fn(async () => ({ text, model: "test" }));
	return {
		gateway: { generate } as unknown as GatewayClient<
			LLMGenerateParams,
			LLMGenerateResult
		>,
	};
}

describe("character-avatar-style plugin", () => {
	it("reuses stored appearance for generated avatars without calling the gateway", async () => {
		setCharacter("Alice", {
			avatarUrl: "https://img/alice.png",
			avatarUploaded: false,
			appearance: "A girl with red hair",
		});
		const ctx = gatewayContext("UNUSED");
		const out = await createCharacterAvatarStylePlugin(
			PROJECT_ID,
		).transformPrompt?.("scene prompt", ctx);

		expect(ctx.gateway?.generate).not.toHaveBeenCalled();
		expect(out).toContain("- Alice: A girl with red hair");
		expect(out).toContain("scene prompt");
	});

	it("falls through to the gateway when appearance is missing at runtime", async () => {
		// updateMetadata/setCharacter accept partial data, so a character with an
		// avatar can exist without an `appearance` despite the non-optional type.
		setCharacter("Bob", {
			avatarUrl: "https://img/bob.png",
			avatarUploaded: false,
		});
		const ctx = gatewayContext("A tall man in a suit");
		const out = await createCharacterAvatarStylePlugin(
			PROJECT_ID,
		).transformPrompt?.("scene prompt", ctx);

		expect(ctx.gateway?.generate).toHaveBeenCalledOnce();
		expect(out).toContain("- Bob: A tall man in a suit");
	});

	it("returns the prompt unchanged when no character has an avatar", async () => {
		setCharacter("Carol", { appearance: "no avatar" });
		const out = await createCharacterAvatarStylePlugin(
			PROJECT_ID,
		).transformPrompt?.("scene prompt", gatewayContext("UNUSED"));

		expect(out).toBe("scene prompt");
	});
});
