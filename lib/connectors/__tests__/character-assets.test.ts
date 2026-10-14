import { describe, expect, it } from "vitest";
import { asset } from "@/lib/canvas/__tests__/_assets";
import type { ContentElement, CanvasElement } from "@/lib/canvas/types";
import {
	createCharacterAssetsPlugin,
	type ParamsWithCharacters,
} from "../plugins/character-assets";
import type { AssetResult } from "../types";
import { dependenciesOf, pluginCtx } from "./_state-ctx";

const RED = "https://img/red.png";
const GRANNY = "https://img/granny.png";
const redVoice = { url: "https://audio/red.mp3", durationSec: 6 };

const element = (type: "image" | "video", prompt: string): ContentElement => ({
	id: type,
	type,
	children: [{ id: "text", type, text: prompt }],
});

const avatar = (imageUrl: string): AssetResult => ({
	imageUrl,
	durationSec: 0,
});

const voice = ({ url, durationSec }: typeof redVoice): AssetResult => ({
	audioUrl: url,
	durationSec,
});

const before = (
	params: ParamsWithCharacters,
	dependencies: Record<string, AssetResult>,
) => {
	const { beforeGenerate } = createCharacterAssetsPlugin({ voices: true });
	if (!beforeGenerate) throw new Error("no beforeGenerate");
	return beforeGenerate(params, pluginCtx({ dependencies }));
};

describe("character asset dependencies", () => {
	const red = asset("asset_avatar", { name: "Red" });
	const wolf = asset("asset_avatar", { name: "Wolf" });
	const redVoiceTile = asset("asset_voice", { name: "Red" });
	const canvas: CanvasElement[] = [red, wolf, redVoiceTile];

	it("depends on each named character's avatar and voice, and on nothing for a name with neither", () => {
		expect(
			dependenciesOf(
				createCharacterAssetsPlugin({ voices: true }),
				element("video", "{{Wolf}} and {{Ghost}} meet {{Red}}"),
				canvas,
			),
		).toEqual({
			"Wolf's avatar": wolf.id,
			"Red's avatar": red.id,
			"Red's voice": redVoiceTile.id,
		});
	});

	it("depends on no voice without voices", () => {
		expect(
			dependenciesOf(
				createCharacterAssetsPlugin({ voices: false }),
				element("image", "{{Red}} waves"),
				canvas,
			),
		).toEqual({ "Red's avatar": red.id });
	});
});

describe("character-assets plugin", () => {
	it("gives each character its avatar and voice, in the order they are named", () => {
		expect(
			before(
				{ prompt: "{{Granny}} hugs {{Red}}, and {{Granny}} smiles" },
				{
					"Red's avatar": avatar(RED),
					"Red's voice": voice(redVoice),
					"Granny's avatar": avatar(GRANNY),
				},
			),
		).toEqual({
			prompt: "{{Granny}} hugs {{Red}}, and {{Granny}} smiles. No nameplates",
			characterAssets: [
				{ name: "Granny", avatarUrl: GRANNY },
				{ name: "Red", avatarUrl: RED, voice: redVoice },
			],
		});
	});

	it("keeps a voice for a character with no avatar, without asking for no nameplates", () => {
		expect(
			before({ prompt: "{{Red}} sings" }, { "Red's voice": voice(redVoice) }),
		).toEqual({
			prompt: "{{Red}} sings",
			characterAssets: [{ name: "Red", voice: redVoice }],
		});
	});

	it.each([
		[
			"characters with neither an avatar nor a voice",
			"{{Wolf}} meets {{Ghost}}",
		],
		["no characters", "An empty road"],
	])("leaves a prompt naming %s alone", (_, prompt) => {
		expect(before({ prompt }, {})).toEqual({ prompt });
	});
});
