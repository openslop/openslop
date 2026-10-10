import { describe, expect, it } from "vitest";
import type { ContentElement, CanvasElement } from "@/lib/canvas/types";
import type { AssetResult } from "../types";
import {
	createCharacterReferencesPlugin,
	type ParamsWithCharacters,
} from "@/lib/connectors/image/plugins/characterReferences";
import { asset } from "@/lib/canvas/__tests__/_assets";
import { dependenciesOf } from "./_stateCtx";

const image = (characters: string): ContentElement => ({
	id: "img",
	type: "image",
	generationAttributes: { characters },
	children: [],
});

function avatarResults(
	avatars: Record<string, string>,
): Record<string, AssetResult> {
	return Object.fromEntries(
		Object.entries(avatars).flatMap(([name, url]) =>
			url ? [[`${name}'s avatar`, { imageUrl: url, durationSec: 0 }]] : [],
		),
	);
}

describe("character avatar dependencies", () => {
	const avatarsOf = (characters: string, canvas: CanvasElement[]) =>
		dependenciesOf(
			createCharacterReferencesPlugin(),
			image(characters),
			canvas,
		);

	it("depends on each named character's avatar, and on nothing for a name no avatar has", () => {
		const red = asset("asset_avatar", { name: "Red" });
		const wolf = asset("asset_avatar", { name: "Wolf" });

		expect(avatarsOf("Wolf, Ghost, Red", [red, wolf])).toEqual({
			"Wolf's avatar": wolf.id,
			"Red's avatar": red.id,
		});
	});

	it("depends on nothing for a character with only a voice", () => {
		const canvas = [asset("asset_voice", { name: "Red" })];

		expect(avatarsOf("Red", canvas)).toEqual({});
	});
});

describe("character-references plugin", () => {
	const RED = "https://img/red.png";
	const GRANNY = "https://img/granny.png";

	it.each([
		[
			"resolves character names to avatar URLs",
			{ Red: RED, Granny: GRANNY },
			"Red,Granny",
			{ prompt: "Hello. No nameplates", referenceImages: [RED, GRANNY] },
		],
		[
			"handles whitespace in character CSV",
			{ Red: RED, Granny: GRANNY },
			" Red , Granny ",
			{ prompt: "Hello. No nameplates", referenceImages: [RED, GRANNY] },
		],
		[
			"filters out characters without avatars and unknown names",
			{ Red: RED, Granny: "" },
			"Red,Granny,Unknown",
			{ prompt: "Hello. No nameplates", referenceImages: [RED] },
		],
		[
			"strips characters from params when no avatars found",
			{ Wolf: "" },
			"Wolf",
			{ prompt: "Hello" },
		],
		[
			"returns params unchanged when no characters attribute",
			{},
			undefined,
			{
				prompt: "Hello",
			},
		],
	])("%s", (_, avatars, characters, expected) => {
		const { beforeGenerate } = createCharacterReferencesPlugin();
		const params: ParamsWithCharacters = { prompt: "Hello", characters };

		expect(
			beforeGenerate?.(params, { dependencies: avatarResults(avatars) }),
		).toEqual(expected);
	});
});
