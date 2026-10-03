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
import { findAsset, getAssets, assetText } from "@/lib/canvas/assets";
import { getElementBodyText } from "@/lib/canvas/osmlSerializer";
import { createCanvasNode } from "@/lib/canvas/createCanvasNode";
import { withAssets } from "../plugins/withAssets";
import { content, scene } from "./fixtures";

const ASSETS = [
	createCanvasNode("style", { id: assetId("style"), text: "noir" }),
	createCanvasNode("cast", {
		id: assetId("cast", "Mia"),
		attrs: { name: "Mia" },
		text: "a girl",
	}),
	createCanvasNode("voice", {
		id: assetId("voice", "Mia"),
		attrs: { name: "Mia", age: "child" },
	}),
];

const bare = (children: Descendant[]) => {
	const editor = withAssets(withReact(createEditor()));
	editor.defaultModels = () => ({});
	editor.children = children;
	return editor;
};

const makeEditor = () =>
	bare([...ASSETS.slice(0, 2), scene([content("narration", "n1", "hello")])]);

const scriptAt = (editor: Editor) =>
	editor.children.findIndex(
		(node) => Element.isElement(node) && node.type === "scene",
	);

describe("withAssets", () => {
	it("makes every asset but the title void and unselectable, and leaves the script editable", () => {
		const editor = bare([
			createCanvasNode("title", { text: "Moon" }),
			...ASSETS,
			scene([content("narration", "n1", "hello")]),
		]);
		const narration = content("narration", "n1", "hello");

		expect(
			editor.children.flatMap((node) =>
				Element.isElement(node) && editor.isSelectable(node) ? [node.type] : [],
			),
		).toEqual(["title", "scene"]);
		expect(
			getAssets(editor.children)
				.filter((asset) => !editor.isVoid(asset))
				.map(({ type }) => type),
		).toEqual(["title"]);
		expect(editor.isVoid(narration)).toBe(false);
	});

	it("still lets a writer change an asset's text", () => {
		const editor = makeEditor();

		setAsset(editor, "style", undefined, { text: "watercolor" });

		const style = findAsset(editor.children, "style");
		expect(style && getElementBodyText(style)).toBe("watercolor");
	});

	it("keeps the caret in the script when it moves back past the assets", () => {
		const editor = bare([
			...ASSETS,
			scene([content("narration", "n1", "hello")]),
		]);
		const start = Editor.start(editor, [ASSETS.length]);
		Transforms.select(editor, start);

		Transforms.move(editor, { reverse: true });

		expect(editor.selection?.anchor).toEqual(start);
	});

	it("refuses a selection placed inside an asset", () => {
		const editor = makeEditor();

		Transforms.select(editor, { path: [0, 0], offset: 0 });

		expect(editor.selection).toBeNull();
	});

	it.each([
		["backspacing", (editor: Editor) => editor.deleteBackward("character")],
		["deleting forward", (editor: Editor) => editor.deleteForward("character")],
	])("leaves the assets alone when %s through the script", (_, press) => {
		const editor = makeEditor();
		const assets = getAssets(editor.children);
		Transforms.select(editor, Editor.start(editor, [scriptAt(editor)]));

		for (let i = 0; i < 8; i++) press(editor);

		expect(getAssets(editor.children)).toEqual(assets);
	});

	it("leaves the assets alone when the whole script is deleted", () => {
		const editor = makeEditor();
		const assets = getAssets(editor.children);
		Transforms.select(editor, Editor.range(editor, [scriptAt(editor)]));

		editor.deleteFragment();
		editor.deleteBackward("character");

		expect(getAssets(editor.children)).toEqual(assets);
	});
});

describe("withAssets and the title", () => {
	const titled = () =>
		bare([
			createCanvasNode("project"),
			createCanvasNode("voice"),
			createCanvasNode("style"),
			createCanvasNode("references"),
			createCanvasNode("title", { text: "Moon" }),
			scene([content("narration", "n1", "hello")]),
		]);
	const titleAt = (editor: Editor) =>
		editor.children.findIndex(
			(node) => Element.isElement(node) && node.type === "title",
		);

	it("lets the caret in and types into the title", () => {
		const editor = titled();
		const end = Editor.end(editor, [titleAt(editor)]);

		Transforms.select(editor, end);
		editor.insertText(" Cat");

		expect(editor.selection?.anchor.path.slice(0, 1)).toEqual([
			titleAt(editor),
		]);
		expect(assetText(editor.children, "title")).toBe("Moon Cat");
	});

	it("refuses Enter inside the title", () => {
		const editor = titled();
		const before = editor.children;
		Transforms.select(editor, Editor.end(editor, [titleAt(editor)]));

		editor.insertBreak();

		expect(editor.children).toBe(before);
	});

	it("does not merge the first scene into the title on backspace", () => {
		const editor = titled();
		expect(scriptAt(editor)).toBe(titleAt(editor) + 1);
		const before = editor.children;
		Transforms.select(editor, Editor.start(editor, [scriptAt(editor)]));

		editor.deleteBackward("character");

		expect(editor.children).toBe(before);
	});
});
