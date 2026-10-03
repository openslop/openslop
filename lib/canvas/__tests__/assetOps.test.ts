import { describe, expect, it } from "vitest";
import { createEditor, type Descendant } from "slate";
import type { ConnectorModels } from "@/lib/connectors/models";
import { DEFAULT_TTS_MODEL } from "@/lib/connectors/tts/models";
import { getPromptText } from "@/lib/generation/inputs";
import {
	removeAsset,
	insertAsset,
	removeAssets,
	removeShownCharacter,
	setAsset,
	setProjectModels,
	setProjectSettings,
	setReferenceImages,
	toggleShownCharacter,
} from "../assetOps";
import {
	castNames,
	findAsset,
	getAssets,
	projectModels,
	projectSettings,
	referenceUrls,
} from "../assets";
import { createCanvasNode } from "../createCanvasNode";
import { shownCharacters } from "../characterNames";
import { findNodeById } from "../editorOps";
import { getContentElements } from "../scenes";
import type { CanvasContentElement, SceneElement } from "../types";
import { asset, references } from "./_assets";

const PINNED = { provider: "runware", model: "Seedream 5 Lite" } as const;
const CARTESIA = { provider: "cartesia", model: "Sonic 3.6" } as const;

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
	])(
		"adds after the assets and ahead of the first scene: $expected",
		({ doc, expected }) => {
			const editor = makeEditor(doc);

			insertAsset(editor, asset("cast", { name: "Mia" }));

			expect(ids(editor.children)).toEqual(expected);
		},
	);
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
			asset("voice", { attrs: { gender: "feminine" }, text: "warm" }),
		]);

		setAsset(editor, "voice", undefined, { attrs: { pitch: "low" } });
		const afterAttrs = findAsset(editor.children, "voice");
		setAsset(editor, "voice", undefined, { text: "cold" });
		const afterText = findAsset(editor.children, "voice");

		expect(afterAttrs && getPromptText(afterAttrs)).toBe("warm");
		expect(afterText?.generationAttributes).toEqual({
			...DEFAULT_TTS_MODEL,
			gender: "feminine",
			pitch: "low",
		});
		expect(afterText && getPromptText(afterText)).toBe("cold");
	});

	it("deletes an attribute set to null or undefined", () => {
		const editor = makeEditor([
			asset("voice", {
				attrs: { gender: "feminine", accent: "british", voiceId: "v1" },
			}),
		]);

		setAsset(editor, "voice", undefined, {
			attrs: { accent: null, voiceId: undefined, pitch: "low" },
		});

		expect(findAsset(editor.children, "voice")?.generationAttributes).toEqual({
			...DEFAULT_TTS_MODEL,
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
		setAsset(editor, "voice", "Mia");
		setAsset(editor, "style", undefined, { text: "ink wash" });

		const attrs = (type: "cast" | "voice" | "style", name?: string) =>
			findAsset(editor.children, type, name)?.generationAttributes;
		expect(attrs("cast", "Mia")).toEqual({ name: "Mia", ...PINNED });
		expect(attrs("cast", "Bob")).toMatchObject({ model: "Slop Image v1" });
		expect(attrs("voice", "Mia")).toEqual({ name: "Mia", ...CARTESIA });
		expect(attrs("style")).toEqual({});
	});
});

describe("setReferenceImages", () => {
	it("holds the deduped list on one references element, replacing or emptying it", () => {
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

		expect(referenceUrls(editor.children)).toEqual([]);
	});
});

describe("removeAssets", () => {
	it("removes every asset and keeps the scenes", () => {
		const first = scene("s1", narration("n1"));
		const editor = makeEditor([
			asset("style", { text: "ink wash" }),
			asset("cast", { name: "Mia" }),
			asset("voice", { name: "Mia" }),
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
			asset("voice", { name: "Mia" }),
			asset("cast", { name: "Bob" }),
			asset("voice", { name: "Bob" }),
			asset("voice", { attrs: { gender: "masculine" } }),
			scene(
				"s1",
				showing("image", "i1", "Mia, Bob"),
				showing("video", "v1", "Mia"),
			),
			scene("s2", showing("image", "i2", "Bob")),
		]);

	it("removes only a character's cast, leaving its voice and every list that names it", () => {
		const editor = makeCast();
		const shown = shownBy(editor);

		removeAsset(editor, "cast", "Mia");

		expect(ids(getAssets(editor.children))).toEqual([
			"style",
			"voice:Mia",
			"cast:Bob",
			"voice:Bob",
			"narrator",
		]);
		expect(castNames(editor.children)).toEqual(["Bob"]);
		expect(shownBy(editor)).toEqual(shown);
	});

	it("removes an asset listed under nothing alone", () => {
		const editor = makeCast();

		removeAsset(editor, "voice", "Mia");

		expect(ids(getAssets(editor.children))).toEqual([
			"style",
			"cast:Mia",
			"cast:Bob",
			"voice:Bob",
			"narrator",
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

describe("the project's settings", () => {
	it("merges and deletes settings on the one project element, and pins models beside them", () => {
		const editor = makeEditor([scene("s1", narration("n1"))]);

		setProjectSettings(editor, { length: "1-3m", template: "t1" });
		setProjectSettings(editor, { format: "faceless", template: null });
		setProjectModels(editor, { image: PINNED, tts: CARTESIA });

		expect(getAssets(editor.children)).toHaveLength(1);
		expect(projectSettings(editor.children)).toEqual({
			language: "auto",
			length: "1-3m",
			format: "faceless",
		});
		expect(projectModels(editor.children)).toEqual({
			image: PINNED,
			tts: CARTESIA,
		});
	});
});
