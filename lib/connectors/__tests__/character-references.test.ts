import { beforeEach, describe, expect, it } from "vitest";
import type { CanvasContentElement } from "@/lib/canvas/types";
import type { AssetResult, ConnectorPlugin } from "../types";
import {
	characterAvatars,
	createCharacterReferencesPlugin,
	type ParamsWithCharacters,
} from "@/lib/connectors/image/plugins/character-references";

/** Keyed by declaring them for an element that names these characters. */
function avatarResults(
	avatars: Record<string, string>,
): Record<string, AssetResult> {
	const element: CanvasContentElement = {
		id: "img",
		type: "image",
		generationAttributes: { characters: Object.keys(avatars).join(", ") },
		children: [],
	};
	const urls = Object.values(avatars);
	return Object.fromEntries(
		characterAvatars
			.specs(element)
			.flatMap(([key], i) =>
				urls[i] ? [[key, { imageUrl: urls[i], durationSec: 0 }]] : [],
			),
	);
}

describe("character-references plugin", () => {
	let plugin: ConnectorPlugin<ParamsWithCharacters>;
	let dependencies: Record<string, AssetResult>;

	const setupCharacters = (avatars: Record<string, string>) => {
		dependencies = avatarResults(avatars);
	};

	function runBeforeGenerate(
		p: ConnectorPlugin<ParamsWithCharacters>,
		params: ParamsWithCharacters,
	) {
		if (!p.beforeGenerate) {
			throw new Error(`Plugin "${p.name}" has no beforeGenerate hook`);
		}
		return p.beforeGenerate(params, { dependencies });
	}

	beforeEach(() => {
		dependencies = {};
		plugin = createCharacterReferencesPlugin();
	});

	it("resolves character names to avatar URLs", () => {
		setupCharacters({
			Red: "https://img/red.png",
			Granny: "https://img/granny.png",
		});

		const result = runBeforeGenerate(plugin, {
			prompt: "Red meets Granny",
			characters: "Red,Granny",
		});

		expect(result).toEqual({
			prompt: "Red meets Granny. No nameplates",
			referenceImages: ["https://img/red.png", "https://img/granny.png"],
		});
	});

	it("strips characters from params when no avatars found", () => {
		setupCharacters({
			Wolf: "",
		});

		const result = runBeforeGenerate(plugin, {
			prompt: "The wolf howls",
			characters: "Wolf",
		});

		expect(result).toEqual({ prompt: "The wolf howls" });
		expect(result).not.toHaveProperty("characters");
	});

	it("returns params unchanged when no characters attribute", () => {
		const params: ParamsWithCharacters = { prompt: "A sunset" };
		const result = runBeforeGenerate(plugin, params);
		expect(result).toEqual(params);
	});

	it("handles whitespace in character CSV", () => {
		setupCharacters({
			Alice: "https://img/alice.png",
			Bob: "https://img/bob.png",
		});

		const result = runBeforeGenerate(plugin, {
			prompt: "Hello",
			characters: " Alice , Bob ",
		});

		expect(result).toEqual({
			prompt: "Hello. No nameplates",
			referenceImages: ["https://img/alice.png", "https://img/bob.png"],
		});
	});

	it("filters out characters without avatars", () => {
		setupCharacters({
			Alice: "https://img/alice.png",
			Bob: "",
		});

		const result = runBeforeGenerate(plugin, {
			prompt: "Hello",
			characters: "Alice,Bob",
		});

		expect(result).toEqual({
			prompt: "Hello. No nameplates",
			referenceImages: ["https://img/alice.png"],
		});
	});

	it("filters out unknown character names", () => {
		setupCharacters({
			Alice: "https://img/alice.png",
		});

		const result = runBeforeGenerate(plugin, {
			prompt: "Hello",
			characters: "Alice,Unknown",
		});

		expect(result).toEqual({
			prompt: "Hello. No nameplates",
			referenceImages: ["https://img/alice.png"],
		});
	});
});
