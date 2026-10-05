import { describe, expect, it } from "vitest";
import { createEditor, type Descendant } from "slate";
import type { ConnectorModels } from "@/lib/connectors/models";
import { DEFAULT_IMAGE_MODEL } from "@/lib/connectors/image/models";
import { DEFAULT_TTS_MODEL } from "@/lib/connectors/tts/models";
import { getPromptText } from "@/lib/generation/inputs";
import {
	ensureSpeaker,
	removeAsset,
	insertAsset,
	removeAssets,
	removeShownCharacter,
	setAsset,
	setReferenceImages,
	toggleShownCharacter,
} from "../assetOps";
import {
	castNames,
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

describe("insertAsset", () => {
	it.each([
		{
			doc: [asset("style"), scene("s1", narration("n1")), scene("s2")],
			expected: ["style", "cast:Mia", "s1", "s2"],
		},
		{ doc: [scene("s1", narration("n1"))], expected: ["cast:Mia", "s1"] },
		{ doc: [], expected: ["cast:Mia"] },
		{
			doc: [asset("cast", { name: "Kai" }), asset("references")],
			expected: ["cast:Kai", "cast:Mia", "references"],
		},
	])(
		"adds after the assets of its type, ahead of the later types and the scenes: $expected",
		({ doc, expected }) => {
			const editor = makeEditor(doc);

			insertAsset(editor, asset("cast", { name: "Mia" }));

			expect(ids(editor.children)).toEqual(expected);
		},
	);

	it("puts the title on top", () => {
		const editor = makeEditor([asset("style"), scene("s1", narration("n1"))]);

		insertAsset(editor, asset("title"));

		expect(ids(editor.children)).toEqual(["title", "style", "s1"]);
	});
});

describe("setAsset", () => {
	it("adds an asset under its fixed id, then updates it in place", () => {
		const editor = makeEditor();

		setAsset(editor, "cast", "Mia", { attrs: PINNED, text: "Brown hair" });
		setAsset(editor, "cast", "Mia", {
			attrs: { model: "Slop Image v1" },
			text: "Red hair",
		});

		expect(getAssets(editor.children)).toHaveLength(1);
		const cast = findAsset(editor.children, "cast", "Mia");
		expect(cast).toMatchObject({
			id: "cast:Mia",
			generationAttributes: { name: "Mia", model: "Slop Image v1" },
		});
		expect(cast && getPromptText(cast)).toBe("Red hair");
	});

	it("leaves the text alone when only attributes change, and the reverse", () => {
		const editor = makeEditor([
			asset("cast", {
				name: "Mia",
				attrs: { gender: "feminine" },
				text: "warm",
			}),
		]);

		setAsset(editor, "cast", "Mia", { attrs: { pitch: "low" } });
		const afterAttrs = findAsset(editor.children, "cast", "Mia");
		setAsset(editor, "cast", "Mia", { text: "cold" });
		const afterText = findAsset(editor.children, "cast", "Mia");

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
			asset("cast", {
				name: "Mia",
				attrs: { gender: "feminine", accent: "british", voiceId: "v1" },
			}),
		]);

		setAsset(editor, "cast", "Mia", {
			attrs: { accent: null, voiceId: undefined, pitch: "low" },
		});

		expect(
			findAsset(editor.children, "cast", "Mia")?.generationAttributes,
		).toEqual({
			...MIA_DEFAULTS,
			gender: "feminine",
			pitch: "low",
		});
	});

	it("stamps a new asset with its default model, and keeps an existing one's", () => {
		const editor = makeEditor(
			[asset("cast", { name: "Bob", attrs: { model: "Slop Image v1" } })],
			{ image: PINNED, tts: CARTESIA },
		);

		setAsset(editor, "cast", "Mia", { text: "Brown hair" });
		setAsset(editor, "cast", "Bob", { text: "Red hair" });
		setAsset(editor, "style", undefined, { text: "ink wash" });

		const attrs = (type: "cast" | "style", name?: string) =>
			findAsset(editor.children, type, name)?.generationAttributes;
		expect(attrs("cast", "Mia")).toEqual({
			name: "Mia",
			...PINNED,
			...voiceAttrs(CARTESIA),
		});
		expect(attrs("cast", "Bob")).toMatchObject({ model: "Slop Image v1" });
		expect(attrs("style")).toEqual({});
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

		expect(ids(editor.children)).toEqual(["references", "s1"]);
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
			asset("style", { text: "ink wash" }),
			asset("cast", { name: "Mia" }),
			asset("cast", { name: NARRATOR, attrs: NO_AVATAR }),
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
	const makeCast = () =>
		makeEditor([
			asset("style", { text: "ink wash" }),
			asset("cast", { name: "Mia" }),
			asset("cast", { name: "Bob" }),
			asset("cast", { name: NARRATOR, attrs: NO_AVATAR }),
			scene(
				"s1",
				showing("image", "i1", "Mia, Bob"),
				showing("video", "v1", "Mia"),
			),
			scene("s2", showing("image", "i2", "Bob")),
		]);

	it("removes only a character's cast, leaving every list that names it", () => {
		const editor = makeCast();
		const shown = shownBy(editor);

		removeAsset(editor, "cast", "Mia");

		expect(ids(getAssets(editor.children))).toEqual([
			"style",
			"cast:Bob",
			"cast:Narrator",
		]);
		expect(castNames(editor.children)).toEqual(["Bob", NARRATOR]);
		expect(shownBy(editor)).toEqual(shown);
	});

	it("removes an asset listed under nothing alone", () => {
		const editor = makeCast();

		removeAsset(editor, "style");

		expect(ids(getAssets(editor.children))).toEqual([
			"cast:Mia",
			"cast:Bob",
			"cast:Narrator",
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

describe("ensureSpeaker", () => {
	it("adds the narrator without an avatar when no one is named", () => {
		const editor = makeEditor([scene("s1", narration("n1"))]);

		expect(ensureSpeaker(editor)).toBe(NARRATOR);

		expect(ids(editor.children)).toEqual(["cast:Narrator", "s1"]);
		expect(
			findAsset(editor.children, "cast", NARRATOR)?.generationAttributes,
		).toMatchObject(NO_AVATAR);
	});

	it("adds a named speaker with an avatar", () => {
		const editor = makeEditor();

		expect(ensureSpeaker(editor, "Mia")).toBe("Mia");

		expect(
			findAsset(editor.children, "cast", "Mia")?.generationAttributes,
		).not.toHaveProperty("avatar");
	});

	it("leaves an existing speaker alone", () => {
		const mia = asset("cast", { name: "Mia", attrs: { gender: "feminine" } });
		const editor = makeEditor([mia]);

		ensureSpeaker(editor, "Mia");

		expect(editor.children).toEqual([mia]);
	});
});
