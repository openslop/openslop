import { describe, expect, it } from "vitest";
import { DEFAULT_IMAGE_MODEL } from "@/lib/connectors/image/models";
import { DEFAULT_TTS_MODEL } from "@/lib/connectors/tts/models";
import { getPromptText } from "@/lib/generation/inputs";
import { assetId } from "../types";
import {
	assetText,
	castNames,
	findAsset,
	formatModel,
	getAssets,
	getScriptElements,
	projectModels,
	projectSettings,
	referenceUrls,
	voiceOf,
} from "../assets";
import { createCanvasNode } from "../createCanvasNode";
import type { SceneElement } from "../types";
import { asset, references } from "./_assets";

const narration = createCanvasNode("narration", { id: "n1", text: "hello" });
const scene: SceneElement = { id: "s1", type: "scene", children: [narration] };

describe("createCanvasNode for an asset", () => {
	it("gives it its fixed id over any id it is given, its name and its text", () => {
		const voice = createCanvasNode("voice", {
			id: "e1",
			attrs: { name: "Mia" },
			text: "warm",
		});

		expect(voice).toMatchObject({
			id: "voice:Mia",
			type: "voice",
			generationAttributes: { name: "Mia" },
		});
		expect(getPromptText(voice)).toBe("warm");
		expect(createCanvasNode("style", { id: "e1" }).id).toBe("style");
	});

	it("draws a character on the default image model, or the recommended one", () => {
		const pinned = { provider: "runware", model: "Seedream 5 Lite" } as const;
		const cast = (defaultModels = {}) =>
			createCanvasNode("cast", { attrs: { name: "Mia" }, defaultModels });

		expect(cast({ image: pinned }).generationAttributes).toEqual({
			name: "Mia",
			...pinned,
		});
		expect(cast().generationAttributes).toEqual({
			name: "Mia",
			...DEFAULT_IMAGE_MODEL,
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
	const narrator = asset("voice", { attrs: { gender: "masculine" } });
	const miaVoice = asset("voice", { name: "Mia" });
	const refs = references("https://img/a.png");
	const nodes = [style, mia, bob, narrator, miaVoice, refs, scene];

	it("finds an asset by type and name, telling a character's voice from the narrator's", () => {
		expect(findAsset(nodes, "cast", "Bob")).toBe(bob);
		expect(findAsset(nodes, "cast", "Ghost")).toBeUndefined();
		expect(findAsset(nodes, "voice", "Mia")).toBe(miaVoice);
		expect(findAsset(nodes, "voice")).toBe(narrator);
		expect(findAsset(nodes, "voice", "Bob")).toBeUndefined();
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

describe("castNames", () => {
	it("lists the characters in document order", () => {
		expect(
			castNames([
				asset("cast", { name: "Mia" }),
				asset("voice", { name: "Zed" }),
				asset("cast", { name: "Bob" }),
			]),
		).toEqual(["Mia", "Bob"]);
	});
});

describe("voiceOf", () => {
	it("is what the voice element says, for the narrator or a character", () => {
		const nodes = [
			asset("voice", { attrs: { gender: "masculine", voiceId: "v-narrator" } }),
			asset("voice", { name: "Mia", attrs: { gender: "feminine" } }),
		];

		expect(voiceOf(nodes)).toEqual({
			...DEFAULT_TTS_MODEL,
			gender: "masculine",
			voiceId: "v-narrator",
		});
		expect(voiceOf(nodes, "Mia")).toMatchObject({ gender: "feminine" });
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

describe("projectSettings", () => {
	it("reads the project element's attributes", () => {
		expect(
			projectSettings([
				asset("project", {
					attrs: {
						language: "fr",
						length: "1-3m",
						format: "faceless",
						template: "t1",
					},
				}),
			]),
		).toEqual({
			language: "fr",
			length: "1-3m",
			format: "faceless",
			template: "t1",
		});
	});

	it("falls back to each default for a missing project or a value it does not know", () => {
		const defaults = { language: "auto", length: "auto", format: "auto" };

		expect(projectSettings([])).toEqual(defaults);
		expect(
			projectSettings([asset("project", { attrs: { length: "forever" } })]),
		).toEqual(defaults);
	});
});

describe("projectModels", () => {
	it("reads each known provider's model pin, keeping slashes in the model", () => {
		const project = asset("project", {
			attrs: {
				image: formatModel({ provider: "runware", model: "Seedream 5 Lite" }),
				llm: "anthropic/claude/sonnet",
				tts: "nobody/x",
				length: "1-3m",
			},
		});

		expect(projectModels([project])).toEqual({
			image: { provider: "runware", model: "Seedream 5 Lite" },
			llm: { provider: "anthropic", model: "claude/sonnet" },
		});
	});
});
