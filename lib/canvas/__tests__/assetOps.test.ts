import { describe, expect, it } from "vitest";
import { createEditor, type Descendant } from "slate";
import type { ConnectorModels } from "@/lib/connectors/models";
import { DEFAULT_IMAGE_MODEL } from "@/lib/connectors/image/models";
import { DEFAULT_TTS_MODEL } from "@/lib/connectors/tts/models";
import { getPromptText } from "@/lib/generation/inputs";
import {
	ensureAsset,
	removeAsset,
	removeAssets,
	removeShownCharacter,
	setAsset,
	setReferenceImages,
	toggleShownCharacter,
} from "../assetOps";
import {
	characterNames,
	findAsset,
	getAssets,
	NARRATOR,
	NO_AVATAR,
	referenceUrls,
	voiceAttrs,
} from "../assets";
import { createCanvasNode } from "../createCanvasNode";
import { shownCharacters } from "../characterNames";
import { findNodeById } from "../editorOps";
import { getContentElements } from "../scenes";
import type { CanvasContentElement, SceneElement } from "../types";
import { asset, references } from "./_assets";

const PINNED = { provider: "runware", model: "Seedream 5 Lite" } as const;
const CARTESIA = { provider: "cartesia", model: "Sonic 3.6" } as const;
const MIA_DEFAULTS = {
	name: "Mia",
	...DEFAULT_IMAGE_MODEL,
	...voiceAttrs(DEFAULT_TTS_MODEL),
};

const narration = (id: string) => createCanvasNode("narration", { id });

const scene = (
	id: string,
	...children: CanvasContentElement[]
): SceneElement => ({ id, type: "scene", children });

function makeEditor(
	children: Descendant[] = [],
	defaultModels: ConnectorModels = {},
) {
	const editor = createEditor();
	editor.defaultModels = () => defaultModels;
	editor.children = children;
	return editor;
}

const ids = (nodes: Descendant[]) =>
	nodes.map((node) => ("id" in node ? node.id : "text"));

const shownBy = (editor: ReturnType<typeof makeEditor>) =>
	getContentElements(editor.children).map(
		(element) => element.generationAttributes?.characters,
	);

describe("setAsset", () => {
	it("adds a new asset at the top, ahead of the script", () => {
		const editor = makeEditor([
			asset("asset_character", { name: "Kai" }),
			scene("s1", narration("n1")),
		]);

		setAsset(editor, "asset_style", undefined);

		expect(ids(editor.children)).toEqual([
			"asset_style",
			"asset_character:Kai",
			"s1",
		]);
	});

	it("adds an asset under its fixed id, then updates it in place", () => {
		const editor = makeEditor();

		setAsset(editor, "asset_character", "Mia", {
			attrs: PINNED,
			text: "Brown hair",
		});
		setAsset(editor, "asset_character", "Mia", {
			attrs: { model: "Slop Image v1" },
			text: "Red hair",
		});

		expect(getAssets(editor.children)).toHaveLength(1);
		const character = findAsset(editor.children, "asset_character", "Mia");
		expect(character).toMatchObject({
			id: "asset_character:Mia",
			generationAttributes: { name: "Mia", model: "Slop Image v1" },
		});
		expect(character && getPromptText(character)).toBe("Red hair");
	});

	it("leaves the text alone when only attributes change, and the reverse", () => {
		const editor = makeEditor([
			asset("asset_character", {
				name: "Mia",
				attrs: { gender: "feminine" },
				text: "warm",
			}),
		]);

		setAsset(editor, "asset_character", "Mia", { attrs: { pitch: "low" } });
		const afterAttrs = findAsset(editor.children, "asset_character", "Mia");
		setAsset(editor, "asset_character", "Mia", { text: "cold" });
		const afterText = findAsset(editor.children, "asset_character", "Mia");

		expect(afterAttrs && getPromptText(afterAttrs)).toBe("warm");
		expect(afterText?.generationAttributes).toEqual({
			...MIA_DEFAULTS,
			gender: "feminine",
			pitch: "low",
		});
		expect(afterText && getPromptText(afterText)).toBe("cold");
	});

	it("deletes an attribute set to null or undefined", () => {
		const editor = makeEditor([
			asset("asset_character", {
				name: "Mia",
				attrs: { gender: "feminine", accent: "british", voiceId: "v1" },
			}),
		]);

		setAsset(editor, "asset_character", "Mia", {
			attrs: { accent: null, voiceId: undefined, pitch: "low" },
		});

		expect(
			findAsset(editor.children, "asset_character", "Mia")
				?.generationAttributes,
		).toEqual({
			...MIA_DEFAULTS,
			gender: "feminine",
			pitch: "low",
		});
	});

	it("stamps a new asset with its default model, and keeps an existing one's", () => {
		const editor = makeEditor(
			[
				asset("asset_character", {
					name: "Bob",
					attrs: { model: "Slop Image v1" },
				}),
			],
			{ image: PINNED, tts: CARTESIA },
		);

		setAsset(editor, "asset_character", "Mia", { text: "Brown hair" });
		setAsset(editor, "asset_character", "Bob", { text: "Red hair" });
		setAsset(editor, "asset_style", undefined, { text: "ink wash" });

		const attrs = (type: "asset_character" | "asset_style", name?: string) =>
			findAsset(editor.children, type, name)?.generationAttributes;
		expect(attrs("asset_character", "Mia")).toEqual({
			name: "Mia",
			...PINNED,
			...voiceAttrs(CARTESIA),
		});
		expect(attrs("asset_character", "Bob")).toMatchObject({
			model: "Slop Image v1",
		});
		expect(attrs("asset_style")).toEqual({});
	});
});

describe("setReferenceImages", () => {
	it("holds the deduped list on one references element, and removes it when emptied", () => {
		const editor = makeEditor([
			references("https://img/x.png"),
			scene("s1", narration("n1")),
		]);

		setReferenceImages(editor, [
			"https://img/a.png",
			"https://img/b.png",
			"https://img/a.png",
		]);

		expect(ids(editor.children)).toEqual(["asset_references", "s1"]);
		expect(referenceUrls(editor.children)).toEqual([
			"https://img/a.png",
			"https://img/b.png",
		]);

		setReferenceImages(editor, []);

		expect(ids(editor.children)).toEqual(["s1"]);
	});
});

describe("removeAssets", () => {
	it("removes every asset and keeps the scenes", () => {
		const first = scene("s1", narration("n1"));
		const editor = makeEditor([
			asset("asset_style", { text: "ink wash" }),
			asset("asset_character", { name: "Mia" }),
			asset("asset_character", { name: NARRATOR, attrs: NO_AVATAR }),
			first,
		]);

		removeAssets(editor);

		expect(editor.children).toEqual([first]);
	});
});

describe("removeAsset", () => {
	const showing = (
		type: "image" | "video",
		id: string,
		characters: string,
	): CanvasContentElement =>
		createCanvasNode(type, { id, attrs: { characters } });
	const makeCharacters = () =>
		makeEditor([
			asset("asset_style", { text: "ink wash" }),
			asset("asset_character", { name: "Mia" }),
			asset("asset_character", { name: "Bob" }),
			asset("asset_character", { name: NARRATOR, attrs: NO_AVATAR }),
			scene(
				"s1",
				showing("image", "i1", "Mia, Bob"),
				showing("video", "v1", "Mia"),
			),
			scene("s2", showing("image", "i2", "Bob")),
		]);

	it("removes only the character's asset, leaving every list that names it", () => {
		const editor = makeCharacters();
		const shown = shownBy(editor);

		removeAsset(editor, "asset_character", "Mia");

		expect(ids(getAssets(editor.children))).toEqual([
			"asset_style",
			"asset_character:Bob",
			"asset_character:Narrator",
		]);
		expect(characterNames(editor.children)).toEqual(["Bob", NARRATOR]);
		expect(shownBy(editor)).toEqual(shown);
	});

	it("removes an asset listed under nothing alone", () => {
		const editor = makeCharacters();

		removeAsset(editor, "asset_style");

		expect(ids(getAssets(editor.children))).toEqual([
			"asset_character:Mia",
			"asset_character:Bob",
			"asset_character:Narrator",
		]);
		expect(shownBy(editor)).toEqual(["Mia, Bob", "Mia", "Bob"]);
	});
});

describe("the characters a visual shows", () => {
	const shot = () =>
		createCanvasNode("image", { id: "img1", attrs: { characters: "Mia" } });
	const live = (editor: ReturnType<typeof makeEditor>) => {
		const found = findNodeById(editor, "img1");
		if (!found) throw new Error("img1 is gone");
		return found[0];
	};

	it("toggles a name on and back off", () => {
		const editor = makeEditor([scene("s1", shot())]);

		toggleShownCharacter(editor, live(editor), "Leo");
		expect(shownCharacters(live(editor))).toEqual(["Mia", "Leo"]);

		toggleShownCharacter(editor, live(editor), "Mia");
		expect(shownCharacters(live(editor))).toEqual(["Leo"]);
	});

	it("removes a name, clearing the attribute once none are left", () => {
		const editor = makeEditor([scene("s1", shot())]);

		removeShownCharacter(editor, shot(), "Mia");

		expect(live(editor).generationAttributes?.characters).toBeUndefined();
	});
});

describe("ensureAsset", () => {
	it("adds the narrator without an avatar", () => {
		const editor = makeEditor([scene("s1", narration("n1"))]);

		ensureAsset(editor, "asset_character", NARRATOR);

		expect(ids(editor.children)).toEqual(["asset_character:Narrator", "s1"]);
		expect(
			findAsset(editor.children, "asset_character", NARRATOR)
				?.generationAttributes,
		).toMatchObject(NO_AVATAR);
	});

	it("adds any other character with an avatar", () => {
		const editor = makeEditor();

		ensureAsset(editor, "asset_character", "Mia");

		expect(
			findAsset(editor.children, "asset_character", "Mia")
				?.generationAttributes,
		).not.toHaveProperty("avatar");
	});

	it("adds an empty art style", () => {
		const editor = makeEditor([scene("s1", narration("n1"))]);

		ensureAsset(editor, "asset_style");

		expect(ids(editor.children)).toEqual(["asset_style", "s1"]);
	});

	it("leaves an existing asset alone", () => {
		const mia = asset("asset_character", {
			name: "Mia",
			attrs: { gender: "feminine" },
		});
		const editor = makeEditor([mia]);

		ensureAsset(editor, "asset_character", "Mia");

		expect(editor.children).toEqual([mia]);
	});
});
