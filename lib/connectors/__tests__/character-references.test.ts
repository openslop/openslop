import { beforeEach, describe, expect, it } from "vitest";
import type { ConnectorPlugin } from "../types";
import {
	createCharacterReferencesPlugin,
	type ParamsWithCharacters,
} from "../plugins/character-references";
import { clearProjectStore, getProjectStore } from "@/lib/project/store";

const PROJECT_ID = "test-char-refs";

function setupCharacters(
	characters: Record<string, { description: string; avatarUrl: string }>,
) {
	const store = getProjectStore(PROJECT_ID);
	for (const [name, data] of Object.entries(characters)) {
		store.getState().setMetadataCharacter(name, data.description);
		if (data.avatarUrl) {
			store.getState().setCharacterAvatarUrl(name, data.avatarUrl);
		}
	}
}

describe("character-references plugin", () => {
	let plugin: ConnectorPlugin<ParamsWithCharacters>;

	beforeEach(() => {
		clearProjectStore(PROJECT_ID);
		plugin = createCharacterReferencesPlugin(PROJECT_ID);
	});

	it("resolves character names to avatar URLs", () => {
		setupCharacters({
			Red: { description: "A girl in red", avatarUrl: "https://img/red.png" },
			Granny: {
				description: "An old woman",
				avatarUrl: "https://img/granny.png",
			},
		});

		const result = plugin.beforeGenerate!({
			prompt: "Red meets Granny",
			characters: "Red,Granny",
		});

		expect(result).toEqual({
			prompt: "Red meets Granny",
			referenceImages: ["https://img/red.png", "https://img/granny.png"],
		});
	});

	it("strips characters from params when no avatars found", () => {
		setupCharacters({
			Wolf: { description: "A big wolf", avatarUrl: "" },
		});

		const result = plugin.beforeGenerate!({
			prompt: "The wolf howls",
			characters: "Wolf",
		});

		expect(result).toEqual({ prompt: "The wolf howls" });
		expect(result).not.toHaveProperty("characters");
	});

	it("returns params unchanged when no characters attribute", () => {
		const params = { prompt: "A sunset" };
		const result = plugin.beforeGenerate!(params as never);
		expect(result).toEqual(params);
	});

	it("handles whitespace in character CSV", () => {
		setupCharacters({
			Alice: { description: "A girl", avatarUrl: "https://img/alice.png" },
			Bob: { description: "A boy", avatarUrl: "https://img/bob.png" },
		});

		const result = plugin.beforeGenerate!({
			prompt: "Hello",
			characters: " Alice , Bob ",
		});

		expect(result).toEqual({
			prompt: "Hello",
			referenceImages: ["https://img/alice.png", "https://img/bob.png"],
		});
	});

	it("filters out characters without avatars", () => {
		setupCharacters({
			Alice: { description: "A girl", avatarUrl: "https://img/alice.png" },
			Bob: { description: "A boy", avatarUrl: "" },
		});

		const result = plugin.beforeGenerate!({
			prompt: "Hello",
			characters: "Alice,Bob",
		});

		expect(result).toEqual({
			prompt: "Hello",
			referenceImages: ["https://img/alice.png"],
		});
	});

	it("filters out unknown character names", () => {
		setupCharacters({
			Alice: { description: "A girl", avatarUrl: "https://img/alice.png" },
		});

		const result = plugin.beforeGenerate!({
			prompt: "Hello",
			characters: "Alice,Unknown",
		});

		expect(result).toEqual({
			prompt: "Hello",
			referenceImages: ["https://img/alice.png"],
		});
	});
});
