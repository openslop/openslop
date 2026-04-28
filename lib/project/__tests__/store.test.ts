import { beforeEach, describe, expect, it } from "vitest";
import { clearProjectStore, getProjectStore } from "../store";

const PROJECT_ID = "store-test";

describe("project store updateMetadata", () => {
	beforeEach(() => clearProjectStore(PROJECT_ID));

	it("sets style without touching characters or narration", () => {
		const store = getProjectStore(PROJECT_ID);
		store.getState().updateMetadata({ style: "cinematic" });

		expect(store.getState().metadata).toEqual({
			style: "cinematic",
			narration: {},
			characters: {},
		});
	});

	it("deep-merges narration so prior voice attributes are preserved", () => {
		const store = getProjectStore(PROJECT_ID);
		store.getState().updateMetadata({ narration: { gender: "male" } });
		store.getState().updateMetadata({ narration: { accent: "british" } });

		expect(store.getState().metadata.narration).toEqual({
			gender: "male",
			accent: "british",
		});
	});

	it("preserves sibling character properties across updates", () => {
		const store = getProjectStore(PROJECT_ID);
		store.getState().updateMetadata({
			characters: { Alice: { description: "A girl" } },
		});
		store.getState().updateMetadata({
			characters: { Alice: { avatarUrl: "https://img/alice.png" } },
		});

		expect(store.getState().metadata.characters["Alice"]).toEqual({
			description: "A girl",
			avatarUrl: "https://img/alice.png",
		});
	});

	it("adds new characters without removing existing ones", () => {
		const store = getProjectStore(PROJECT_ID);
		store.getState().updateMetadata({
			characters: { Alice: { description: "A girl" } },
		});
		store.getState().updateMetadata({
			characters: { Bob: { description: "A boy" } },
		});

		expect(Object.keys(store.getState().metadata.characters).sort()).toEqual([
			"Alice",
			"Bob",
		]);
	});
});
