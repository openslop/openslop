import { describe, expect, it } from "vitest";
import { DEFAULT_IMAGE_MODEL } from "@/lib/connectors/image/models";
import { DEFAULT_TTS_MODEL } from "@/lib/connectors/tts/models";
import { getPromptText } from "@/lib/generation/inputs";
import { assetId } from "../types";
import {
	assetText,
	avatarNames,
	characterNames,
	findAsset,
	getAssets,
	getScriptElements,
	NARRATOR,
	referenceUrls,
	voiceFrom,
	voiceOf,
} from "../assets";
import { createCanvasNode } from "../createCanvasNode";
import type { SceneElement } from "../types";
import { asset, references } from "./_assets";

const narration = createCanvasNode("narration", { id: "n1", text: "hello" });
const scene: SceneElement = { id: "s1", type: "scene", children: [narration] };

describe("createCanvasNode for an asset", () => {
	it("gives it its fixed id over any id it is given, its name and its text", () => {
		const avatar = createCanvasNode("asset_avatar", {
			id: "e1",
			attrs: { name: "Mia" },
			text: "warm",
		});

		expect(avatar).toMatchObject({
			id: "asset_avatar:Mia",
			type: "asset_avatar",
			generationAttributes: { name: "Mia" },
		});
		expect(getPromptText(avatar)).toBe("warm");
		expect(createCanvasNode("asset_style", { id: "e1" }).id).toBe(
			"asset_style",
		);
	});

	it("draws an avatar on the default image model, or the recommended one", () => {
		const pinned = { provider: "runware", model: "Seedream 5 Lite" } as const;
		const avatar = (defaultModels = {}) =>
			createCanvasNode("asset_avatar", {
				attrs: { name: "Mia" },
				defaultModels,
			}).generationAttributes;

		expect(avatar({ image: pinned })).toEqual({ name: "Mia", ...pinned });
		expect(avatar()).toEqual({ name: "Mia", ...DEFAULT_IMAGE_MODEL });
	});

	it("puts a voice on the default speech model, or the recommended one", () => {
		const cartesia = { provider: "cartesia", model: "Sonic 3.6" } as const;
		const voice = (defaultModels = {}) =>
			createCanvasNode("asset_voice", { attrs: { name: "Mia" }, defaultModels })
				.generationAttributes;

		expect(voice({ tts: cartesia })).toEqual({ name: "Mia", ...cartesia });
		expect(voice()).toEqual({ name: "Mia", ...DEFAULT_TTS_MODEL });
	});
});

describe("getAssets and getScriptElements", () => {
	it("pick the assets out in order, then the content of each scene", () => {
		const style = asset("asset_style");
		const mia = asset("asset_avatar", { name: "Mia" });

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
	const mia = asset("asset_avatar", { name: "Mia" });
	const bob = asset("asset_avatar", { name: "Bob" });
	const bobsVoice = asset("asset_voice", { name: "Bob" });
	const refs = references("https://img/a.png");
	const nodes = [style, mia, bob, bobsVoice, refs, scene];

	it("finds an asset by type and name", () => {
		expect(findAsset(nodes, "asset_avatar", "Bob")).toBe(bob);
		expect(findAsset(nodes, "asset_voice", "Bob")).toBe(bobsVoice);
		expect(findAsset(nodes, "asset_voice", "Mia")).toBeUndefined();
		expect(findAsset(nodes, "asset_avatar")).toBeUndefined();
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
			assetText([asset("asset_avatar", { name: "Mia" })], "asset_style"),
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
		asset("asset_avatar", { name: "Mia" }),
		asset("asset_voice", { name: "Mia" }),
		asset("asset_voice", { name: NARRATOR }),
		scene,
		asset("asset_avatar", { name: "Bob" }),
	];

	it("lists everyone with a look or a voice once, the narrator among them", () => {
		expect(characterNames(nodes)).toEqual(["Mia", "Bob", NARRATOR]);
	});

	it("lists only who has an avatar as who a picture can show", () => {
		expect(avatarNames(nodes)).toEqual(["Mia", "Bob"]);
	});
});

describe("voiceOf", () => {
	it("reads a speaker's voice, the narrator's when no one is named", () => {
		const nodes = [
			asset("asset_voice", {
				name: NARRATOR,
				attrs: { gender: "masculine", voiceId: "v-narrator" },
			}),
			asset("asset_avatar", { name: "Mia", text: "Brown hair" }),
			asset("asset_voice", {
				name: "Mia",
				attrs: { gender: "feminine", description: "husky" },
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
		expect(voiceOf([asset("asset_voice", { name: "Mia" })], "Ghost")).toEqual(
			{},
		);
	});
});

describe("voiceFrom", () => {
	it("reads a voice asset's attributes as the voice, leaving its name out", () => {
		const voice = {
			provider: "cartesia",
			model: "Sonic 3.6",
			voiceId: "v1",
			description: "husky",
			gender: "feminine",
			accent: "british",
		} as const;

		expect(
			voiceFrom(asset("asset_voice", { name: "Mia", attrs: voice })),
		).toEqual(voice);
	});

	it("is empty, never missing, with no voice", () => {
		expect(voiceFrom()).toEqual({});
	});
});
