import { beforeEach, describe, expect, it } from "vitest";
import { clearProjectStore, getProjectStore } from "../store";

const PROJECT_ID = "store-test";

describe("project store updateMetadata", () => {
	beforeEach(() => clearProjectStore(PROJECT_ID));

	it("sets style without touching characters or narration", () => {
		const store = getProjectStore(PROJECT_ID);
		store.getState().updateMetadata({ style: "cinematic" });

		expect(store.getState().metadata).toEqual({
			title: "",
			style: "cinematic",
			narration: {},
			characters: {},
		});
	});

	it("deep-merges narration so prior voice attributes are preserved", () => {
		const store = getProjectStore(PROJECT_ID);
		store.getState().updateMetadata({ narration: { gender: "masculine" } });
		store.getState().updateMetadata({ narration: { accent: "british" } });

		expect(store.getState().metadata.narration).toEqual({
			gender: "masculine",
			accent: "british",
		});
	});

	it("preserves sibling character properties across updates", () => {
		const store = getProjectStore(PROJECT_ID);
		store.getState().updateMetadata({
			characters: { Alice: { appearance: "A girl" } },
		});
		store.getState().updateMetadata({
			characters: { Alice: { avatarUrl: "https://img/alice.png" } },
		});

		expect(store.getState().metadata.characters["Alice"]).toEqual({
			appearance: "A girl",
			avatarUrl: "https://img/alice.png",
		});
	});

	it("reset returns the store to initial state", () => {
		const store = getProjectStore(PROJECT_ID);
		store.getState().updateMetadata({
			title: "My Project",
			style: "cinematic",
			narration: { gender: "masculine" },
			characters: { Alice: { appearance: "A girl" } },
		});
		store.getState().setReferenceImages(["https://img/ref.png"]);

		store.getState().reset();

		expect(store.getState().metadata).toEqual({
			title: "",
			style: "",
			narration: {},
			characters: {},
		});
		expect(store.getState().referenceImages).toEqual([]);
	});

	it("adds new characters without removing existing ones", () => {
		const store = getProjectStore(PROJECT_ID);
		store.getState().updateMetadata({
			characters: { Alice: { appearance: "A girl" } },
		});
		store.getState().updateMetadata({
			characters: { Bob: { appearance: "A boy" } },
		});

		expect(Object.keys(store.getState().metadata.characters).sort()).toEqual([
			"Alice",
			"Bob",
		]);
	});

	it("setCharacter fully replaces a character (clearing previous keys)", () => {
		const store = getProjectStore(PROJECT_ID);
		store.getState().updateMetadata({
			characters: {
				Alice: { appearance: "A girl", voiceId: "voice-1", accent: "british" },
			},
		});
		store
			.getState()
			.setCharacter("Alice", { appearance: "Updated", accent: "american" });

		expect(store.getState().metadata.characters["Alice"]).toEqual({
			appearance: "Updated",
			accent: "american",
		});
	});

	it("removeCharacter deletes the entry", () => {
		const store = getProjectStore(PROJECT_ID);
		store.getState().setCharacter("Alice", { appearance: "A girl" });
		store.getState().setCharacter("Bob", { appearance: "A boy" });
		store.getState().removeCharacter("Alice");

		expect(store.getState().metadata.characters).toEqual({
			Bob: { appearance: "A boy" },
		});
	});
});
