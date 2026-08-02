import { afterEach, describe, expect, it } from "vitest";
import { createCharacterAvatarPlugin } from "@/lib/connectors/image/plugins/character-avatar";
import { clearProjectStore, getProjectStore } from "@/lib/project/store";
import { stateCtx } from "./_state-ctx";

const PROJECT_ID = "character-avatar-test";

afterEach(() => clearProjectStore(PROJECT_ID));

describe("character-avatar plugin", () => {
	it("builds the avatar prompt from character appearance", () => {
		getProjectStore(PROJECT_ID)
			.getState()
			.updateMetadata({
				characters: { Alice: { appearance: "A young girl with red hair" } },
			});

		const plugin = createCharacterAvatarPlugin("Alice");
		expect(plugin.transformPrompt?.("ignored", stateCtx(PROJECT_ID))).toBe(
			'Character portrait of Alice. A young girl with red hair. A small rectangular nameplate at the bottom of the frame reads "Alice" in clean sans-serif lettering. White background',
		);
	});

	it("passes an image result through untouched", () => {
		const result = { imageUrl: "https://img/alice.png", durationSec: 0 };
		const plugin = createCharacterAvatarPlugin("Alice");
		expect(plugin.afterGenerate?.(result)).toEqual(result);
	});

	it("throws when the generation produced no image", () => {
		const plugin = createCharacterAvatarPlugin("Alice");
		expect(() => plugin.afterGenerate?.({ durationSec: 0 })).toThrow(
			/imageUrl/,
		);
	});
});
