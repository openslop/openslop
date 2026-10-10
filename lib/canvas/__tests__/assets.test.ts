import { describe, expect, it } from "vitest";
import { DEFAULT_TTS_MODEL } from "@/lib/connectors/tts/models";
import {
	assetText,
	avatarNames,
	characterNames,
	findAsset,
	getAssets,
	getCanvasElements,
	NARRATOR,
	referenceUrls,
	voiceFrom,
	voiceOf,
} from "../assets";
import { createCanvasElement } from "../createCanvasElement";
import type { Scene } from "../types";
import { asset, references } from "./_assets";

const narration = createCanvasElement("narration", { id: "n1", text: "hello" });
const scene: Scene = { id: "s1", type: "scene", children: [narration] };

describe("getAssets and getCanvasElements", () => {
	it("pick the assets out in order, then the content of each scene", () => {
		const style = asset("asset_style");
		const mia = asset("asset_avatar", { name: "Mia" });

		expect(getAssets([style, scene, mia])).toEqual([style, mia]);
		expect(getCanvasElements([style, scene, mia])).toEqual([
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
				attrs: { gender: "masculine" },
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
