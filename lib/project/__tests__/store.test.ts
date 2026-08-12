import { describe, expect, it } from "vitest";
import { createProjectStore } from "../store";
import { MetadataSchema } from "../types";

describe("project store updateMetadata", () => {
	it("sets style without touching characters or narration", () => {
		const store = createProjectStore();
		store.getState().updateMetadata({ style: "cinematic" });

		expect(store.getState().metadata).toEqual(
			MetadataSchema.parse({ style: "cinematic" }),
		);
	});

	it("deep-merges narration so prior voice attributes are preserved", () => {
		const store = createProjectStore();
		store.getState().updateMetadata({ narration: { gender: "masculine" } });
		store.getState().updateMetadata({ narration: { accent: "british" } });

		expect(store.getState().metadata.narration).toEqual({
			gender: "masculine",
			accent: "british",
		});
	});

	it("preserves sibling character properties across updates", () => {
		const store = createProjectStore();
		store.getState().updateMetadata({
			characters: { Alice: { appearance: "A girl" } },
		});
		store.getState().updateMetadata({
			characters: { Alice: { avatarUploaded: true } },
		});

		expect(store.getState().metadata.characters["Alice"]).toEqual({
			appearance: "A girl",
			avatarUploaded: true,
		});
	});

	it("reset returns the store to initial state", () => {
		const store = createProjectStore();
		store.getState().updateMetadata({
			title: "My Project",
			style: "cinematic",
			narration: { gender: "masculine" },
			characters: { Alice: { appearance: "A girl" } },
		});
		store.getState().setReferenceImages(["https://img/ref.png"]);

		store.getState().reset();

		expect(store.getState().metadata).toEqual(MetadataSchema.parse({}));
		expect(store.getState().referenceImages).toEqual([]);
	});

	it("adds new characters without removing existing ones", () => {
		const store = createProjectStore();
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
		const store = createProjectStore();
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

	it("updateCharacter merges into the existing entry", () => {
		const store = createProjectStore();
		store
			.getState()
			.setCharacter("Alice", { appearance: "A girl", accent: "british" });
		store.getState().updateCharacter("Alice", { avatarUploaded: true });

		expect(store.getState().metadata.characters["Alice"]).toEqual({
			appearance: "A girl",
			accent: "british",
			avatarUploaded: true,
		});
	});

	it("updateCharacter throws for an unknown character", () => {
		const store = createProjectStore();
		expect(() =>
			store.getState().updateCharacter("Nobody", { avatarUploaded: true }),
		).toThrow(/Nobody/);
	});

	it("addReferenceImages appends to the existing images", () => {
		const store = createProjectStore();
		store.getState().setReferenceImages(["a.png"]);
		store.getState().addReferenceImages(["b.png", "c.png"]);

		expect(store.getState().referenceImages).toEqual([
			"a.png",
			"b.png",
			"c.png",
		]);
	});

	it("removeReferenceImage drops only the image at the given index", () => {
		const store = createProjectStore();
		store.getState().setReferenceImages(["a.png", "b.png", "c.png"]);
		store.getState().removeReferenceImage(1);

		expect(store.getState().referenceImages).toEqual(["a.png", "c.png"]);
	});

	it("removeCharacter deletes the entry", () => {
		const store = createProjectStore();
		store.getState().setCharacter("Alice", { appearance: "A girl" });
		store.getState().setCharacter("Bob", { appearance: "A boy" });
		store.getState().removeCharacter("Alice");

		expect(store.getState().metadata.characters).toEqual({
			Bob: { appearance: "A boy" },
		});
	});
});
