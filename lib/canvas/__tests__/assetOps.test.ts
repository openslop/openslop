import { describe, expect, it } from "vitest";
import { DEFAULT_TTS_MODEL } from "@/lib/connectors/tts/models";
import { getPromptText } from "@/lib/generation/inputs";
import {
	addCharacter,
	ensureAsset,
	removeAsset,
	removeAssets,
	removeCharacter,
	removeShownCharacter,
	setAsset,
	setReferenceImages,
	toggleShownCharacter,
} from "../assetOps";
import {
	avatarNames,
	characterNames,
	findAsset,
	getAssets,
	NARRATOR,
	referenceUrls,
} from "../assets";
import { createCanvasElement } from "../createCanvasElement";
import { flatAttributes } from "../elementAttributes";
import { shownCharacters } from "../characterNames";
import { findElementById } from "../editorOps";
import { getContentElements } from "../scenes";
import type { AssetType, ContentElement, Scene } from "../types";
import { asset, labels, makeEditor, references } from "./_assets";

const PINNED = { provider: "runware", model: "Seedream 5 Lite" } as const;
const CARTESIA = { provider: "cartesia", model: "Sonic 3.6" } as const;

const narration = (id: string) => createCanvasElement("narration", { id });

const scene = (id: string, ...children: ContentElement[]): Scene => ({
	id,
	type: "scene",
	children,
});

const shownBy = (editor: ReturnType<typeof makeEditor>) =>
	getContentElements(editor.children).map(
		(element) => element.generationAttributes?.characters,
	);

describe("setAsset", () => {
	it("adds a new asset at the top, ahead of the script", () => {
		const editor = makeEditor([
			asset("asset_avatar", { name: "Kai" }),
			scene("s1", narration("n1")),
		]);

		setAsset(editor, "asset_style", undefined);

		expect(labels(editor.children)).toEqual([
			"asset_style",
			"asset_avatar:Kai",
			"s1",
		]);
	});

	it("adds an asset, then updates it in place", () => {
		const editor = makeEditor();

		setAsset(editor, "asset_avatar", "Mia", {
			attrs: PINNED,
			text: "Brown hair",
		});
		setAsset(editor, "asset_avatar", "Mia", {
			attrs: { model: "Slop Image v1" },
			text: "Red hair",
		});

		expect(getAssets(editor.children)).toHaveLength(1);
		const avatar = findAsset(editor.children, "asset_avatar", "Mia");
		expect(avatar).toMatchObject({
			generationAttributes: { name: "Mia", model: "Slop Image v1" },
		});
		expect(avatar && getPromptText(avatar)).toBe("Red hair");
	});

	it("leaves the text alone when only attributes change, and the reverse", () => {
		const editor = makeEditor([
			asset("asset_avatar", { name: "Mia", text: "warm" }),
		]);

		setAsset(editor, "asset_avatar", "Mia", { attrs: PINNED });
		const afterAttrs = findAsset(editor.children, "asset_avatar", "Mia");
		setAsset(editor, "asset_avatar", "Mia", { text: "cold" });
		const afterText = findAsset(editor.children, "asset_avatar", "Mia");

		expect(afterAttrs && getPromptText(afterAttrs)).toBe("warm");
		expect(afterText?.generationAttributes).toEqual({ name: "Mia", ...PINNED });
		expect(afterText && getPromptText(afterText)).toBe("cold");
	});

	it("deletes an attribute set to null or undefined", () => {
		const editor = makeEditor([
			asset("asset_voice", {
				name: "Mia",
				attrs: { gender: "feminine", accent: "british", voiceId: "v1" },
			}),
		]);

		setAsset(editor, "asset_voice", "Mia", {
			attrs: { accent: null, voiceId: undefined, pitch: "low" },
		});

		expect(
			findAsset(editor.children, "asset_voice", "Mia")?.generationAttributes,
		).toEqual({
			name: "Mia",
			...DEFAULT_TTS_MODEL,
			gender: "feminine",
			pitch: "low",
		});
	});

	it("stamps a new asset with its default model, and keeps an existing one's", () => {
		const editor = makeEditor(
			[
				asset("asset_avatar", {
					name: "Bob",
					attrs: { model: "Slop Image v1" },
				}),
			],
			{ image: PINNED, voice: CARTESIA },
		);

		setAsset(editor, "asset_avatar", "Mia", { text: "Brown hair" });
		setAsset(editor, "asset_voice", "Mia");
		setAsset(editor, "asset_avatar", "Bob", { text: "Red hair" });
		setAsset(editor, "asset_style", undefined, { text: "ink wash" });

		const attrs = (type: AssetType, name?: string) =>
			findAsset(editor.children, type, name)?.generationAttributes;
		expect(attrs("asset_avatar", "Mia")).toEqual({ name: "Mia", ...PINNED });
		expect(attrs("asset_voice", "Mia")).toEqual({ name: "Mia", ...CARTESIA });
		expect(attrs("asset_avatar", "Bob")).toMatchObject({
			model: "Slop Image v1",
		});
		expect(attrs("asset_style")).toEqual({});
	});
});

describe("setReferenceImages", () => {
	it("holds the deduped list on one references element, kept when emptied", () => {
		const editor = makeEditor([
			references("https://img/x.png"),
			scene("s1", narration("n1")),
		]);

		setReferenceImages(editor, [
			"https://img/a.png",
			"https://img/b.png",
			"https://img/a.png",
		]);

		expect(labels(editor.children)).toEqual(["asset_references", "s1"]);
		expect(referenceUrls(editor.children)).toEqual([
			"https://img/a.png",
			"https://img/b.png",
		]);

		setReferenceImages(editor, []);

		expect(labels(editor.children)).toEqual(["asset_references", "s1"]);
		expect(referenceUrls(editor.children)).toEqual([]);
	});
});

describe("removeAssets", () => {
	it("removes every asset and keeps the scenes", () => {
		const first = scene("s1", narration("n1"));
		const editor = makeEditor([
			asset("asset_style", { text: "ink wash" }),
			asset("asset_avatar", { name: "Mia" }),
			asset("asset_voice", { name: "Mia" }),
			asset("asset_voice", { name: NARRATOR }),
			first,
		]);

		removeAssets(editor);

		expect(editor.children).toEqual([first]);
	});
});

describe("removeAsset and removeCharacter", () => {
	const showing = (
		type: "image" | "video",
		id: string,
		characters: string,
	): ContentElement => createCanvasElement(type, { id, attrs: { characters } });
	const makeCharacters = () =>
		makeEditor([
			asset("asset_style", { text: "ink wash" }),
			asset("asset_avatar", { name: "Mia" }),
			asset("asset_voice", { name: "Mia" }),
			asset("asset_avatar", { name: "Bob" }),
			asset("asset_voice", { name: NARRATOR }),
			scene(
				"s1",
				showing("image", "i1", "Mia, Bob"),
				showing("video", "v1", "Mia"),
			),
			scene("s2", showing("image", "i2", "Bob")),
		]);

	it("removes a character's avatar and voice, leaving every list that names it", () => {
		const editor = makeCharacters();
		const shown = shownBy(editor);

		removeCharacter(editor, "Mia");

		expect(labels(getAssets(editor.children))).toEqual([
			"asset_style",
			"asset_avatar:Bob",
			"asset_voice:Narrator",
		]);
		expect(characterNames(editor.children)).toEqual(["Bob", NARRATOR]);
		expect(shownBy(editor)).toEqual(shown);
	});

	it("restores what it removed, the character's look and voice back as they were", () => {
		const editor = makeCharacters();
		const before = getAssets(editor.children).map(flatAttributes);

		removeCharacter(editor, "Mia")();

		expect(getAssets(editor.children).map(flatAttributes)).toEqual(
			expect.arrayContaining(before),
		);
		expect(characterNames(editor.children)).toEqual(["Mia", "Bob", NARRATOR]);
	});

	it("removes only the avatar, so the character keeps its voice and drops out of pictures", () => {
		const editor = makeCharacters();

		removeAsset(editor, "asset_avatar", "Mia");

		expect(findAsset(editor.children, "asset_voice", "Mia")).toBeDefined();
		expect(avatarNames(editor.children)).toEqual(["Bob"]);
		expect(characterNames(editor.children)).toContain("Mia");
	});

	it("removes an asset listed under nothing alone", () => {
		const editor = makeCharacters();

		removeAsset(editor, "asset_style");

		expect(labels(getAssets(editor.children))).toEqual([
			"asset_avatar:Mia",
			"asset_voice:Mia",
			"asset_avatar:Bob",
			"asset_voice:Narrator",
		]);
		expect(shownBy(editor)).toEqual(["Mia, Bob", "Mia", "Bob"]);
	});
});

describe("the characters a visual shows", () => {
	const shot = () =>
		createCanvasElement("image", { id: "img1", attrs: { characters: "Mia" } });
	const live = (editor: ReturnType<typeof makeEditor>) => {
		const found = findElementById(editor, "img1");
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

describe("addCharacter", () => {
	it("gives a new character a look and a voice", () => {
		const editor = makeEditor([scene("s1", narration("n1"))]);

		addCharacter(editor, "Mia");

		expect(labels(editor.children)).toEqual(
			expect.arrayContaining(["asset_avatar:Mia", "asset_voice:Mia"]),
		);
	});

	it("gives the narrator a voice alone", () => {
		const editor = makeEditor([scene("s1", narration("n1"))]);

		addCharacter(editor, NARRATOR);

		expect(labels(editor.children)).toEqual(["asset_voice:Narrator", "s1"]);
	});
});

describe("ensureAsset", () => {
	it("adds an empty art style", () => {
		const editor = makeEditor([scene("s1", narration("n1"))]);

		ensureAsset(editor, "asset_style");

		expect(labels(editor.children)).toEqual(["asset_style", "s1"]);
	});

	it("leaves an existing asset alone", () => {
		const mia = asset("asset_voice", {
			name: "Mia",
			attrs: { gender: "feminine" },
		});
		const editor = makeEditor([mia]);

		ensureAsset(editor, "asset_voice", "Mia");

		expect(editor.children).toEqual([mia]);
	});
});
