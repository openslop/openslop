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

		const plugin = createCharacterAvatarPlugin(
			PROJECT_ID,
			"Alice",
			"A young girl with red hair",
			"sig",
		);
		expect(plugin.transformPrompt?.("ignored")).toBe(
			'Character portrait of Alice. A young girl with red hair. A small rectangular nameplate at the bottom of the frame reads "Alice" in clean sans-serif lettering. White background',
		);
	});

	it("writes avatarUrl to metadata on success", () => {
		const store = getProjectStore(PROJECT_ID);
		store
			.getState()
			.updateMetadata({ characters: { Alice: { appearance: "A girl" } } });

		const plugin = createCharacterAvatarPlugin(
			PROJECT_ID,
			"Alice",
			"A girl",
			"sig",
		);
		plugin.afterGenerate?.({
			imageUrl: "https://img/alice.png",
			durationSec: 0,
		});

		expect(store.getState().metadata.characters["Alice"].avatarUrl).toBe(
			"https://img/alice.png",
		);
	});

	it("records the inputs signature the job carried, not a live recomputation", () => {
		const store = getProjectStore(PROJECT_ID);
		store
			.getState()
			.updateMetadata({ characters: { Alice: { appearance: "A girl" } } });

		// Plugin was built from a snapshot signature; the user edits appearance
		// while the job is in flight.
		const plugin = createCharacterAvatarPlugin(
			PROJECT_ID,
			"Alice",
			"A girl",
			"snapshot-sig",
		);
		store.getState().setCharacter("Alice", { appearance: "A boy" });
		plugin.afterGenerate?.({
			imageUrl: "https://img/alice.png",
			durationSec: 0,
		});

		// The recorded signature is the snapshot, so the now-divergent live inputs
		// correctly read as stale and will auto-regenerate.
		expect(
			store.getState().metadata.characters["Alice"].avatarInputsSignature,
		).toBe("snapshot-sig");
	});

	it("does not resurrect a character that was removed mid-flight", () => {
		const store = getProjectStore(PROJECT_ID);
		store
			.getState()
			.updateMetadata({ characters: { Alice: { appearance: "A girl" } } });

		const plugin = createCharacterAvatarPlugin(
			PROJECT_ID,
			"Alice",
			"A girl",
			"sig",
		);
		store.getState().removeCharacter("Alice");
		plugin.afterGenerate?.({
			imageUrl: "https://img/alice.png",
			durationSec: 0,
		});

		expect(store.getState().metadata.characters["Alice"]).toBeUndefined();
	});
});
