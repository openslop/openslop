import { describe, expect, it } from "vitest";
import {
	createEditor,
	Editor,
	Element,
	Transforms,
	type Descendant,
} from "slate";
import { withReact } from "slate-react";
import { assetId } from "@/lib/canvas/types";
import { setAsset } from "@/lib/canvas/assetOps";
import { findAsset, assetText } from "@/lib/canvas/assets";
import { getElementBodyText } from "@/lib/canvas/osmlSerializer";
import { createCanvasNode } from "@/lib/canvas/createCanvasNode";
import { withAssets } from "../plugins/withAssets";
import { content, scene } from "./fixtures";

const TITLE = createCanvasNode("asset_title", { text: "Moon" });
const STYLE = createCanvasNode("asset_style", {
	id: assetId("asset_style"),
	text: "noir",
});
const CAST = createCanvasNode("asset_character", {
	id: assetId("asset_character", "Mia"),
	attrs: { name: "Mia" },
	text: "a girl",
});
const REFERENCES = createCanvasNode("asset_references", {
	id: assetId("asset_references"),
});

const bare = (children: Descendant[]) => {
	const editor = withAssets(withReact(createEditor()));
	editor.defaultModels = () => ({});
	editor.children = children;
	return editor;
};

const script = () => scene([content("narration", "n1", "hello")]);

const indexOf = (editor: Editor, type: string) =>
	editor.children.findIndex(
		(node) => Element.isElement(node) && node.type === type,
	);

const types = (editor: Editor) =>
	editor.children.flatMap((node) =>
		Element.isElement(node) ? [node.type] : [],
	);

const selectScriptStart = (editor: Editor) =>
	Transforms.select(editor, Editor.start(editor, [indexOf(editor, "scene")]));

describe("withAssets", () => {
	it("makes every asset but the title a void", () => {
		const editor = bare([TITLE, STYLE, CAST, REFERENCES, script()]);

		expect(
			editor.children.flatMap((node) =>
				Element.isElement(node) && editor.isVoid(node) ? [node.type] : [],
			),
		).toEqual(["asset_style", "asset_character", "asset_references"]);
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
			indexOf(editor, "asset_character"),
		);
	});

	it("deletes the tile ahead of the script on backspace", () => {
		const editor = bare([STYLE, CAST, script()]);
		selectScriptStart(editor);

		editor.deleteBackward("character");

		expect(types(editor)).toEqual(["asset_style", "scene"]);
	});

	it("does nothing on Enter while a tile is selected", () => {
		const editor = bare([STYLE, script()]);
		const before = editor.children;
		Transforms.select(editor, Editor.start(editor, [0]));

		editor.insertBreak();

		expect(editor.children).toBe(before);
	});
});

describe("withAssets and the title", () => {
	it("lets the caret in and types into the title", () => {
		const editor = bare([TITLE, STYLE, script()]);
		const end = Editor.end(editor, [0]);

		Transforms.select(editor, end);
		editor.insertText(" Cat");

		expect(editor.selection?.anchor.path.slice(0, 1)).toEqual([0]);
		expect(assetText(editor.children, "asset_title")).toBe("Moon Cat");
	});

	it("refuses Enter inside the title", () => {
		const editor = bare([TITLE, script()]);
		const before = editor.children;
		Transforms.select(editor, Editor.end(editor, [0]));

		editor.insertBreak();

		expect(editor.children).toBe(before);
	});

	it.each([
		[
			"backspacing at the start of the script",
			(editor: Editor) => {
				selectScriptStart(editor);
				editor.deleteBackward("character");
			},
		],
		[
			"deleting forward at the end of the title",
			(editor: Editor) => {
				Transforms.select(editor, Editor.end(editor, [0]));
				editor.deleteForward("character");
			},
		],
	])("never merges the script into the title when %s", (_, press) => {
		const editor = bare([TITLE, script()]);
		const before = editor.children;

		press(editor);

		expect(editor.children).toEqual(before);
	});

	it("types over a selection from the title into the script without merging them", () => {
		const editor = bare([TITLE, CAST, script()]);
		Transforms.select(editor, {
			anchor: { path: [0, 1], offset: 2 },
			focus: { path: [2, 0, 0], offset: 2 },
		});

		editor.insertText("x");

		expect(assetText(editor.children, "asset_title")).toBe("Mox");
		expect(types(editor)).toEqual(["asset_title", "scene"]);
		expect(Editor.string(editor, [indexOf(editor, "scene")])).toBe("llo");
	});

	it("keeps the title when the whole document is deleted", () => {
		const editor = bare([TITLE, STYLE, script()]);
		Transforms.select(editor, Editor.range(editor, []));

		editor.deleteFragment();

		expect(types(editor)[0]).toBe("asset_title");
		expect(findAsset(editor.children, "asset_style")).toBeUndefined();
	});
});
