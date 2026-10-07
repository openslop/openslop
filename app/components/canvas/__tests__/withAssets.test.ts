import { describe, expect, it } from "vitest";
import {
	createEditor,
	Editor,
	Element,
	Transforms,
	type Descendant,
} from "slate";
import { withReact } from "slate-react";
import { setAsset } from "@/lib/canvas/assetOps";
import { findAsset } from "@/lib/canvas/assets";
import { getElementBodyText } from "@/lib/canvas/osmlSerializer";
import { asset } from "@/lib/canvas/__tests__/_assets";
import { withAssets } from "../plugins/withAssets";
import { withNodeId } from "../plugins/withNodeId";
import { content, scene } from "./fixtures";

const STYLE = asset("asset_style", { text: "noir" });
const CAST = asset("asset_avatar", { name: "Mia", text: "a girl" });
const VOICE = asset("asset_voice", { name: "Mia" });
const REFERENCES = asset("asset_references");

const bare = (children: Descendant[], plugins = withAssets) => {
	const editor = plugins(withReact(createEditor()));
	editor.defaultModels = () => ({});
	editor.children = children;
	return editor;
};

const script = (id = "s1") => scene([content("narration", id, "hello")], id);

const indexOf = (editor: Editor, type: string) =>
	editor.children.findIndex(
		(node) => Element.isElement(node) && node.type === type,
	);

const ids = (editor: Editor) =>
	editor.children.map((node) => ("id" in node ? node.id : "text"));

const selectScriptStart = (editor: Editor) =>
	Transforms.select(editor, Editor.start(editor, [indexOf(editor, "scene")]));

describe("withAssets", () => {
	it("makes every asset a void", () => {
		const editor = bare([STYLE, CAST, VOICE, REFERENCES, script()]);

		expect(
			editor.children.flatMap((node) =>
				Element.isElement(node) && editor.isVoid(node) ? [node.type] : [],
			),
		).toEqual([
			"asset_style",
			"asset_avatar",
			"asset_voice",
			"asset_references",
		]);
	});

	it("still lets a writer change an asset's text", () => {
		const editor = bare([STYLE, script()]);

		setAsset(editor, "asset_style", undefined, { text: "watercolor" });

		const style = findAsset(editor.children, "asset_style");
		expect(style && getElementBodyText(style)).toBe("watercolor");
	});

	it("selects the tile ahead of the script when the caret moves back onto it", () => {
		const editor = bare([STYLE, CAST, script()]);
		selectScriptStart(editor);

		Transforms.move(editor, { reverse: true });

		expect(editor.selection?.anchor.path[0]).toBe(
			indexOf(editor, "asset_avatar"),
		);
	});

	it("deletes the tile ahead of the script on backspace", () => {
		const editor = bare([STYLE, CAST, script()]);
		selectScriptStart(editor);

		editor.deleteBackward("character");

		expect(ids(editor)).toEqual(["asset_style", "s1"]);
	});

	it("does nothing on Enter while a tile is selected", () => {
		const editor = bare([STYLE, script()]);
		const before = editor.children;
		Transforms.select(editor, Editor.start(editor, [0]));

		editor.insertBreak();

		expect(editor.children).toBe(before);
	});

	it("moves a tile added among the scenes up ahead of the script", () => {
		const editor = bare([STYLE, script(), script("s2")]);

		Transforms.insertNodes(editor, CAST, { at: [2] });

		expect(ids(editor)).toEqual([
			"asset_avatar:Mia",
			"asset_style",
			"s1",
			"s2",
		]);
	});

	it.each([
		["character", CAST],
		["art style", STYLE],
	])("keeps the %s it holds when a copy of it is pasted", (_, tile) => {
		const editor = bare([tile, script()], (editor) =>
			withNodeId(withAssets(editor)),
		);
		Transforms.select(editor, Editor.end(editor, [1]));

		editor.insertFragment([structuredClone(tile)]);

		expect(ids(editor)).toEqual([tile.id, "s1"]);
		expect(editor.children[0]).toBe(tile);
	});
});
