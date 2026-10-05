import { describe, expect, it } from "vitest";
import { DEFAULT_IMAGE_MODEL } from "@/lib/connectors/image/models";
import { DEFAULT_TTS_MODEL } from "@/lib/connectors/tts/models";
import { getPromptText } from "@/lib/generation/inputs";
import { assetId } from "../types";
import {
	assetText,
	avatarNames,
	castNames,
	castVoice,
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
		const cast = createCanvasNode("cast", {
			id: "e1",
			attrs: { name: "Mia" },
			text: "warm",
		});

		expect(cast).toMatchObject({
			id: "cast:Mia",
			type: "cast",
			generationAttributes: { name: "Mia" },
		});
		expect(getPromptText(cast)).toBe("warm");
		expect(createCanvasNode("style", { id: "e1" }).id).toBe("style");
	});

	it("draws a character on the default image model and voices it on the default voice model, or the recommended ones", () => {
		const pinned = { provider: "runware", model: "Seedream 5 Lite" } as const;
		const cartesia = { provider: "cartesia", model: "Sonic 3.6" } as const;
		const cast = (defaultModels = {}) =>
			createCanvasNode("cast", { attrs: { name: "Mia" }, defaultModels });

		expect(cast({ image: pinned, tts: cartesia }).generationAttributes).toEqual(
			{ name: "Mia", ...pinned, ...voiceAttrs(cartesia) },
		);
		expect(cast().generationAttributes).toEqual({
			name: "Mia",
			...DEFAULT_IMAGE_MODEL,
			...voiceAttrs(DEFAULT_TTS_MODEL),
		});
	});
});

describe("getAssets and getScriptElements", () => {
	it("pick the assets out in order, then the content of each scene", () => {
		const style = asset("style");
		const mia = asset("cast", { name: "Mia" });

		expect(getAssets([style, scene, mia])).toEqual([style, mia]);
		expect(getScriptElements([style, scene, mia])).toEqual([
			style,
			mia,
			narration,
		]);
	});
});

describe("findAsset", () => {
	const style = asset("style", { text: "ink wash" });
	const mia = asset("cast", { name: "Mia" });
	const bob = asset("cast", { name: "Bob" });
	const refs = references("https://img/a.png");
	const nodes = [style, mia, bob, refs, scene];

	it("finds an asset by type and name", () => {
		expect(findAsset(nodes, "cast", "Bob")).toBe(bob);
		expect(findAsset(nodes, "cast", "Ghost")).toBeUndefined();
		expect(findAsset(nodes, "cast")).toBeUndefined();
		expect(findAsset(nodes, "style")).toBe(style);
		expect(findAsset(nodes, "references")).toBe(refs);
	});

	it("does not take a content element that happens to hold an asset's id", () => {
		const impostor = createCanvasNode("image", { id: assetId("style") });

		expect(findAsset([impostor], "style")).toBeUndefined();
	});
});

describe("assetText of the style", () => {
	it("is the style asset's text, or empty with no style", () => {
		expect(assetText([asset("style", { text: "ink wash" })], "style")).toBe(
			"ink wash",
		);
		expect(assetText([asset("cast", { name: "Mia" })], "style")).toBe("");
	});
});

describe("referenceUrls", () => {
	it("lists the references element's images in order, or none", () => {
		expect(
			referenceUrls([references("https://img/b.png", "https://img/a.png")]),
		).toEqual(["https://img/b.png", "https://img/a.png"]);
		expect(referenceUrls([])).toEqual([]);
		expect(referenceUrls([asset("references")])).toEqual([]);
	});
});

describe("castNames and avatarNames", () => {
	const nodes = [
		asset("cast", { name: "Mia" }),
		asset("cast", { name: NARRATOR, attrs: NO_AVATAR }),
		scene,
		asset("cast", { name: "Bob" }),
	];

	it("list the cast in document order, the narrator among them", () => {
		expect(castNames(nodes)).toEqual(["Mia", NARRATOR, "Bob"]);
	});

	it("leave out the narrator when listing who a picture can show", () => {
		expect(avatarNames(nodes)).toEqual(["Mia", "Bob"]);
	});
});

describe("voiceOf", () => {
	it("reads a cast member's voice keys, the narrator's when no one is named", () => {
		const nodes = [
			asset("cast", {
				name: NARRATOR,
				attrs: { ...NO_AVATAR, gender: "masculine", voiceId: "v-narrator" },
			}),
			asset("cast", {
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
		expect(voiceOf([asset("cast", { name: "Mia" })], "Ghost")).toEqual({});
	});
});

describe("assetText of the title", () => {
	it("is the title asset's text, or empty with no title", () => {
		expect(assetText([asset("title", { text: "Night shift" })], "title")).toBe(
			"Night shift",
		);
		expect(assetText([scene], "title")).toBe("");
	});
});

describe("castVoice and voiceAttrs", () => {
	it("round-trip a voice through a cast member's attributes, apart from its image model", () => {
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
		expect(castVoice(asset("cast", { name: "Mia", attrs }))).toEqual(voice);
	});

	it("is empty, never missing, with no cast member", () => {
		expect(castVoice()).toEqual({});
	});
});
