import { describe, expect, it } from "vitest";
import {
	createEditor,
	Editor,
	Element,
	Transforms,
	type Descendant,
} from "slate";
import { withReact } from "slate-react";
import { setAsset } from "@/lib/canvas/asset-ops";
import { findAsset } from "@/lib/canvas/assets";
import { getElementBodyText } from "@/lib/canvas/osml-serializer";
import { asset, labels } from "@/lib/canvas/__tests__/_assets";
import { withAssets } from "../plugins/with-assets";
import { withNodeId } from "../plugins/with-node-id";
import { content, scene } from "./fixtures";

const STYLE = asset("asset_style", { text: "noir" });
const AVATAR = asset("asset_avatar", { name: "Mia", text: "a girl" });
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

const selectScriptStart = (editor: Editor) =>
	Transforms.select(editor, Editor.start(editor, [indexOf(editor, "scene")]));

describe("withAssets", () => {
	it("makes every asset a void", () => {
		const editor = bare([STYLE, AVATAR, VOICE, REFERENCES, script()]);

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

	it("sends a caret that moves onto an asset back to the start of the script", () => {
		const editor = bare([STYLE, AVATAR, script()]);
		selectScriptStart(editor);

		Transforms.move(editor, { reverse: true });
		editor.onChange();

		expect(editor.selection?.anchor).toEqual(
			Editor.start(editor, [indexOf(editor, "scene")]),
		);
	});

	it("leaves the assets alone on backspace at the start of the script", () => {
		const editor = bare([STYLE, AVATAR, script()]);
		selectScriptStart(editor);

		editor.deleteBackward("character");

		expect(labels(editor.children)).toEqual([
			"asset_style",
			"asset_avatar:Mia",
			"s1",
		]);
	});

	it("takes the assets along in a selection of the whole canvas", () => {
		const editor = bare([STYLE, AVATAR, script()]);
		Transforms.select(editor, Editor.range(editor, []));

		expect(labels(editor.getFragment())).toEqual([
			"asset_style",
			"asset_avatar:Mia",
			"s1",
		]);
	});

	it("moves an asset added among the scenes up ahead of the script", () => {
		const editor = bare([STYLE, script(), script("s2")]);

		Transforms.insertNodes(editor, AVATAR, { at: [2] });

		expect(labels(editor.children)).toEqual([
			"asset_avatar:Mia",
			"asset_style",
			"s1",
			"s2",
		]);
	});

	it.each([
		["character", AVATAR],
		["art style", STYLE],
	])("keeps the %s it holds when a copy of it is pasted", (_, held) => {
		const editor = bare([held, script()], (editor) =>
			withNodeId(withAssets(editor)),
		);
		Transforms.select(editor, Editor.end(editor, [1]));

		editor.insertFragment([structuredClone(held)]);

		expect(labels(editor.children)).toEqual(labels([held, script()]));
		expect(editor.children[0]).toBe(held);
	});
});
