import { describe, expect, it } from "vitest";
import { DEFAULT_IMAGE_MODEL } from "@/lib/connectors/image/models";
import { DEFAULT_TTS_MODEL } from "@/lib/connectors/tts/models";
import { getPromptText } from "@/lib/generation/inputs";
import { assetId } from "../types";
import {
	assetText,
	avatarNames,
	characterNames,
	characterVoice,
	findAsset,
	getAssets,
	getScriptElements,
	NARRATOR,
	NO_AVATAR,
	referenceUrls,
	voiceAttrs,
	voiceOf,
} from "../assets";
import { createCanvasNode } from "../createCanvasNode";
import type { SceneElement } from "../types";
import { asset, references } from "./_assets";

const narration = createCanvasNode("narration", { id: "n1", text: "hello" });
const scene: SceneElement = { id: "s1", type: "scene", children: [narration] };

describe("createCanvasNode for an asset", () => {
	it("gives it its fixed id over any id it is given, its name and its text", () => {
		const character = createCanvasNode("asset_character", {
			id: "e1",
			attrs: { name: "Mia" },
			text: "warm",
		});

		expect(character).toMatchObject({
			id: "asset_character:Mia",
			type: "asset_character",
			generationAttributes: { name: "Mia" },
		});
		expect(getPromptText(character)).toBe("warm");
		expect(createCanvasNode("asset_style", { id: "e1" }).id).toBe(
			"asset_style",
		);
	});

	it("draws a character on the default image model and voices it on the default voice model, or the recommended ones", () => {
		const pinned = { provider: "runware", model: "Seedream 5 Lite" } as const;
		const cartesia = { provider: "cartesia", model: "Sonic 3.6" } as const;
		const character = (defaultModels = {}) =>
			createCanvasNode("asset_character", {
				attrs: { name: "Mia" },
				defaultModels,
			});

		expect(
			character({ image: pinned, tts: cartesia }).generationAttributes,
		).toEqual({ name: "Mia", ...pinned, ...voiceAttrs(cartesia) });
		expect(character().generationAttributes).toEqual({
			name: "Mia",
			...DEFAULT_IMAGE_MODEL,
			...voiceAttrs(DEFAULT_TTS_MODEL),
		});
	});
});

describe("getAssets and getScriptElements", () => {
	it("pick the assets out in order, then the content of each scene", () => {
		const style = asset("asset_style");
		const mia = asset("asset_character", { name: "Mia" });

		expect(getAssets([style, scene, mia])).toEqual([style, mia]);
		expect(getScriptElements([style, scene, mia])).toEqual([
			style,
			mia,
			narration,
		]);
	});
});

describe("findAsset", () => {
	const style = asset("asset_style", { text: "ink wash" });
	const mia = asset("asset_character", { name: "Mia" });
	const bob = asset("asset_character", { name: "Bob" });
	const refs = references("https://img/a.png");
	const nodes = [style, mia, bob, refs, scene];

	it("finds an asset by type and name", () => {
		expect(findAsset(nodes, "asset_character", "Bob")).toBe(bob);
		expect(findAsset(nodes, "asset_character", "Ghost")).toBeUndefined();
		expect(findAsset(nodes, "asset_character")).toBeUndefined();
		expect(findAsset(nodes, "asset_style")).toBe(style);
		expect(findAsset(nodes, "asset_references")).toBe(refs);
	});

	it("does not take a content element that happens to hold an asset's id", () => {
		const impostor = createCanvasNode("image", { id: assetId("asset_style") });

		expect(findAsset([impostor], "asset_style")).toBeUndefined();
	});
});

describe("assetText of the style", () => {
	it("is the style asset's text, or empty with no style", () => {
		expect(
			assetText([asset("asset_style", { text: "ink wash" })], "asset_style"),
		).toBe("ink wash");
		expect(
			assetText([asset("asset_character", { name: "Mia" })], "asset_style"),
		).toBe("");
	});
});

describe("referenceUrls", () => {
	it("lists the references element's images in order, or none", () => {
		expect(
			referenceUrls([references("https://img/b.png", "https://img/a.png")]),
		).toEqual(["https://img/b.png", "https://img/a.png"]);
		expect(referenceUrls([])).toEqual([]);
		expect(referenceUrls([asset("asset_references")])).toEqual([]);
	});
});

describe("characterNames and avatarNames", () => {
	const nodes = [
		asset("asset_character", { name: "Mia" }),
		asset("asset_character", { name: NARRATOR, attrs: NO_AVATAR }),
		scene,
		asset("asset_character", { name: "Bob" }),
	];

	it("list the characters in document order, the narrator among them", () => {
		expect(characterNames(nodes)).toEqual(["Mia", NARRATOR, "Bob"]);
	});

	it("leave out the narrator when listing who a picture can show", () => {
		expect(avatarNames(nodes)).toEqual(["Mia", "Bob"]);
	});
});

describe("voiceOf", () => {
	it("reads a character's voice keys, the narrator's when no one is named", () => {
		const nodes = [
			asset("asset_character", {
				name: NARRATOR,
				attrs: { ...NO_AVATAR, gender: "masculine", voiceId: "v-narrator" },
			}),
			asset("asset_character", {
				name: "Mia",
				attrs: { gender: "feminine", voiceDescription: "husky" },
				text: "Brown hair",
			}),
		];

		expect(voiceOf(nodes)).toEqual({
			...DEFAULT_TTS_MODEL,
			gender: "masculine",
			voiceId: "v-narrator",
		});
		expect(voiceOf(nodes, "Mia")).toEqual({
			...DEFAULT_TTS_MODEL,
			gender: "feminine",
			description: "husky",
		});
	});

	it("is empty, never missing, for a speaker nothing is known of", () => {
		expect(voiceOf([])).toEqual({});
		expect(
			voiceOf([asset("asset_character", { name: "Mia" })], "Ghost"),
		).toEqual({});
	});
});

describe("characterVoice and voiceAttrs", () => {
	it("round-trip a voice through a character's attributes, apart from its image model", () => {
		const voice = {
			provider: "cartesia",
			model: "Sonic 3.6",
			voiceId: "v1",
			description: "husky",
			gender: "feminine",
			accent: "british",
		} as const;
		const attrs = voiceAttrs(voice);

		expect(attrs).toEqual({
			voiceProvider: "cartesia",
			voiceModel: "Sonic 3.6",
			voiceId: "v1",
			voiceDescription: "husky",
			gender: "feminine",
			accent: "british",
		});
		expect(
			characterVoice(asset("asset_character", { name: "Mia", attrs })),
		).toEqual(voice);
	});

	it("is empty, never missing, with no character", () => {
		expect(characterVoice()).toEqual({});
	});
});
