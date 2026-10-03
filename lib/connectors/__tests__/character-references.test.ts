import { beforeEach, describe, expect, it } from "vitest";
import type { CanvasContentElement } from "@/lib/canvas/types";
import type { AssetResult, ConnectorPlugin } from "../types";
import {
	characterAvatars,
	createCharacterReferencesPlugin,
	type ParamsWithCharacters,
} from "@/lib/connectors/image/plugins/character-references";
import { asset } from "@/lib/canvas/__tests__/_assets";
import { buildCtx, edgesOf } from "./_state-ctx";

const image = (characters: string): CanvasContentElement => ({
	id: "img",
	type: "image",
	generationAttributes: { characters },
	children: [],
});

function avatarResults(
	avatars: Record<string, string>,
): Record<string, AssetResult> {
	const names = Object.keys(avatars);
	const canvas = names.map((name) => asset("cast", { name }));
	return Object.fromEntries(
		characterAvatars
			.edges(image(names.join(", ")), buildCtx(canvas))
			.flatMap(([key], i) => {
				const url = avatars[names[i] ?? ""];
				return url ? [[key, { imageUrl: url, durationSec: 0 }]] : [];
			}),
	);
}

describe("characterAvatars", () => {
	it("depends on each named character's cast element, and on nothing for a name the cast does not know", () => {
		const canvas = [
			asset("cast", { name: "Red" }),
			asset("cast", { name: "Wolf" }),
		];

		expect(
			edgesOf(characterAvatars, image("Wolf, Ghost, Red"), canvas),
		).toEqual([
			["avatar:Wolf", "cast:Wolf", "Wolf's avatar"],
			["avatar:Red", "cast:Red", "Red's avatar"],
		]);
	});
});

describe("character-references plugin", () => {
	let plugin: ConnectorPlugin<ParamsWithCharacters>;
	let dependencies: Record<string, AssetResult>;

	const setupCharacters = (avatars: Record<string, string>) => {
		dependencies = avatarResults(avatars);
	};

	function runBeforeGenerate(params: ParamsWithCharacters) {
		if (!plugin.beforeGenerate) {
			throw new Error(`Plugin "${plugin.name}" has no beforeGenerate hook`);
		}
		return plugin.beforeGenerate(params, { dependencies });
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

		const result = runBeforeGenerate({
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

		const result = runBeforeGenerate({
			prompt: "The wolf howls",
			characters: "Wolf",
		});

		expect(result).toEqual({ prompt: "The wolf howls" });
		expect(result).not.toHaveProperty("characters");
	});

	it("returns params unchanged when no characters attribute", () => {
		const params: ParamsWithCharacters = { prompt: "A sunset" };
		const result = runBeforeGenerate(params);
		expect(result).toEqual(params);
	});

	it("handles whitespace in character CSV", () => {
		setupCharacters({
			Alice: "https://img/alice.png",
			Bob: "https://img/bob.png",
		});

		const result = runBeforeGenerate({
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

		const result = runBeforeGenerate({
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

		const result = runBeforeGenerate({
			prompt: "Hello",
			characters: "Alice,Unknown",
		});

		expect(result).toEqual({
			prompt: "Hello. No nameplates",
			referenceImages: ["https://img/alice.png"],
		});
	});
});
