import { describe, expect, it, vi } from "vitest";
import { createEditor, Transforms } from "slate";
import { withReact } from "slate-react";
import { withAssets } from "../plugins/withAssets";
import { withScenes } from "../plugins/withScenes";
import { withFlatPaste } from "../plugins/withFlatPaste";
import { withNodeId } from "../plugins/withNodeId";
import { withOSMLClipboard } from "../plugins/withOSMLClipboard";
import { findAsset } from "@/lib/canvas/assets";
import { getContentElements } from "@/lib/canvas/scenes";
import { content, scene, seedScene } from "./fixtures";
import { getElementBodyText } from "@/lib/canvas/osmlSerializer";
import type { CanvasEditor, Scene } from "@/lib/canvas/types";

function fakeDataTransfer(initial: Record<string, string> = {}): DataTransfer {
	const store = { ...initial };
	return {
		getData: (format: string) => store[format] ?? "",
		setData: (format: string, value: string) => {
			store[format] = value;
		},
	} as unknown as DataTransfer;
}

/**
 * The real base handlers need a mounted DOM, so they are stubbed: the assertions
 * here are about what the plugin does versus what it hands back to the default.
 */
function makeEditor(seed: Scene) {
	const base = withNodeId(
		withFlatPaste(withScenes(withAssets(withReact(createEditor())))),
	);
	const insertTextData = vi.fn(() => true);
	base.setFragmentData = vi.fn();
	base.insertTextData = insertTextData;

	const editor = withOSMLClipboard(base);
	editor.defaultModels = () => ({});
	seedScene(editor, seed);

	return { editor, insertTextData };
}

const copy = (editor: CanvasEditor) => {
	const data = fakeDataTransfer();
	editor.setFragmentData(data, "copy");
	return data.getData("text/plain");
};

const paste = (editor: CanvasEditor, text: string) =>
	editor.insertTextData(fakeDataTransfer({ "text/plain": text }));

const elementOfType = (editor: CanvasEditor, type: string) =>
	getContentElements(editor.children).find((el) => el.type === type);

describe("withOSMLClipboard copy", () => {
	it("writes a whole-element selection as OSML, attributes included", () => {
		const { editor } = makeEditor(
			scene([
				{
					...content("character", "c1", "Hi there"),
					generationAttributes: { name: "Lyra" },
				},
			]),
		);
		Transforms.select(editor, []);

		expect(copy(editor)).toBe(
			'--- Scene 1 ---\n<character id="c1" name="Lyra">Hi there</character>',
		);
	});

	it("leaves a partial selection inside one element as plain text", () => {
		const { editor } = makeEditor(
			scene([content("narration", "n1", "Hello world")]),
		);
		const path = [0, 0, 0];
		Transforms.select(editor, {
			anchor: { path, offset: 1 },
			focus: { path, offset: 4 },
		});

		expect(copy(editor)).toBe("");
	});

	it("leaves a caret in an empty element as plain text", () => {
		const { editor } = makeEditor(scene([content("narration", "n1")]));

		expect(copy(editor)).toBe("");
	});
});

describe("withOSMLClipboard paste", () => {
	it("rebuilds elements with their attributes in place of the empty element at the caret", () => {
		const { editor } = makeEditor(scene([content("narration", "n0")]));

		const handled = paste(
			editor,
			'<image id="i1">a sunset</image>\n<character id="c1" name="Lyra">Hi there</character>',
		);

		expect(handled).toBe(true);
		const image = elementOfType(editor, "image");
		expect(image && getElementBodyText(image)).toBe("a sunset");
		expect(elementOfType(editor, "character")?.generationAttributes?.name).toBe(
			"Lyra",
		);
		expect(elementOfType(editor, "narration")).toBeUndefined();
	});

	it("keeps the assets a script carries", () => {
		const { editor } = makeEditor(scene([content("narration", "n0")]));

		paste(
			editor,
			'<asset_style id="asset_style">noir</asset_style>\n--- Scene 1 ---\n<image id="i1">a sunset</image>',
		);

		const style = findAsset(editor.children, "asset_style");
		expect(style && getElementBodyText(style)).toBe("noir");
		expect(elementOfType(editor, "image")).toBeDefined();
	});

	it("merges the first element's text into a non-empty element at the caret, as any paste does", () => {
		const { editor } = makeEditor(scene([content("narration", "n0", "start")]));

		paste(editor, '<image id="i1">a sunset</image>');

		const narration = elementOfType(editor, "narration");
		expect(narration && getElementBodyText(narration)).toBe("starta sunset");
	});

	it("strips scene markers instead of folding them into element text", () => {
		const { editor } = makeEditor(scene([content("narration", "n0")]));

		paste(
			editor,
			'--- Scene 1 ---\n<image id="i1">a sunset</image>\n--- Scene 2 ---\n<image id="i2">a river</image>',
		);

		expect(
			getContentElements(editor.children)
				.filter((el) => el.type === "image")
				.map(getElementBodyText),
		).toEqual(["a sunset", "a river"]);
	});

	it("mints fresh ids so pasted elements do not share generation state", () => {
		const { editor } = makeEditor(scene([content("narration", "n0")]));

		paste(editor, '<image id="i1">a sunset</image>');

		const image = elementOfType(editor, "image");
		expect(image).toBeDefined();
		expect(image?.id).not.toBe("i1");
	});

	it("defers text that parses to no elements", () => {
		const { editor, insertTextData } = makeEditor(
			scene([content("narration", "n0", "start")]),
		);

		paste(editor, "just some prose, no tags here");
		paste(editor, "<div>hello</div>");

		expect(insertTextData).toHaveBeenCalledTimes(2);
		expect(getContentElements(editor.children).length).toBe(1);
	});
});
