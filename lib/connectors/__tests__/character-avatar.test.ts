import { afterEach, describe, expect, it } from "vitest";
import { createCharacterAvatarPlugin } from "@/lib/connectors/image/plugins/character-avatar";
import { clearProjectStore, getProjectStore } from "@/lib/project/store";

const PROJECT_ID = "character-avatar-test";

afterEach(() => clearProjectStore(PROJECT_ID));

describe("character-avatar plugin", () => {
	it("builds the avatar prompt from character appearance", () => {
		getProjectStore(PROJECT_ID)
			.getState()
			.updateMetadata({
				characters: { Alice: { appearance: "A young girl with red hair" } },
			});

		const plugin = createCharacterAvatarPlugin(PROJECT_ID, "Alice");
		expect(plugin.transformPrompt?.("ignored")).toBe(
			'Character portrait of Alice. A young girl with red hair. A small rectangular nameplate at the bottom of the frame reads "Alice" in clean sans-serif lettering. White background',
		);
	});

	it("writes avatarUrl to metadata on success", () => {
		const store = getProjectStore(PROJECT_ID);
		store
			.getState()
			.updateMetadata({ characters: { Alice: { appearance: "A girl" } } });

		const plugin = createCharacterAvatarPlugin(PROJECT_ID, "Alice");
		plugin.afterGenerate?.({
			imageUrl: "https://img/alice.png",
			durationSec: 0,
		});

		expect(store.getState().metadata.characters["Alice"].avatarUrl).toBe(
			"https://img/alice.png",
		);
	});

	it("does not resurrect a character that was removed mid-flight", () => {
		const store = getProjectStore(PROJECT_ID);
		store
			.getState()
			.updateMetadata({ characters: { Alice: { appearance: "A girl" } } });

		const plugin = createCharacterAvatarPlugin(PROJECT_ID, "Alice");
		store.getState().removeCharacter("Alice");
		plugin.afterGenerate?.({
			imageUrl: "https://img/alice.png",
			durationSec: 0,
		});

		expect(store.getState().metadata.characters["Alice"]).toBeUndefined();
	});
});
