import { describe, expect, it } from "vitest";
import { createEditor, type Editor } from "slate";
import { flatAttributes } from "@/lib/canvas/elementAttributes";
import { isContentElement } from "@/lib/canvas/guards";
import { getElementBodyText } from "@/lib/canvas/osmlSerializer";
import type { ConnectorModels } from "@/lib/connectors/models";
import { assetId } from "@/lib/canvas/types";
import { createCanvasNode } from "@/lib/canvas/createCanvasNode";
import { createScriptWriter } from "../scriptWriter";

const makeEditor = (defaultModels: ConnectorModels = {}) => {
	const editor = createEditor();
	editor.defaultModels = () => defaultModels;
	return editor;
};

const elements = (editor: Editor): [type: string, text: string][] =>
	editor.children
		.filter(isContentElement)
		.map((element) => [element.type, getElementBodyText(element)]);

describe("createScriptWriter", () => {
	it("grows an element in the document as its text arrives", () => {
		const editor = makeEditor();
		const write = createScriptWriter(editor);

		write("<narration>");
		write("Once upon");
		expect(elements(editor)).toEqual([["narration", "Once upon"]]);

		write(" a time, far away");
		expect(elements(editor)).toEqual([
			["narration", "Once upon a time, far away"],
		]);
	});

	it("starts a streamed element on the editor's default model", () => {
		const pinned = { provider: "cartesia", model: "Sonic 3.6" } as const;
		const editor = makeEditor({ tts: pinned });

		createScriptWriter(editor)("<narration>Once upon a time</narration>\n");

		expect(
			editor.children.filter(isContentElement).map(flatAttributes),
		).toMatchObject([pinned]);
	});

	it("writes later text through the editor, never into the node it inserted", () => {
		const editor = makeEditor();
		const write = createScriptWriter(editor);
		write("<narration>");
		write("Once upon");
		const inserted = editor.children[0];

		write(" a time, far away");

		expect(editor.children[0]).not.toBe(inserted);
		expect(inserted).toMatchObject({
			children: [{}, { text: "Once upon" }],
		});
	});

	it("holds an element back until it has text", () => {
		const editor = makeEditor();
		const write = createScriptWriter(editor);

		write("<image>a wolf</image>\n<narration>");
		expect(elements(editor)).toEqual([["image", "a wolf"]]);

		write("The wolf howled at the moon");
		expect(elements(editor)).toEqual([
			["image", "a wolf"],
			["narration", "The wolf howled at the moon"],
		]);
	});

	it("writes every element of a chunk, however many it carries", () => {
		const editor = makeEditor();
		const lines = ["one", "two", "three", "four", "five"];

		createScriptWriter(editor)(
			lines.map((line) => `<narration>${line}</narration>`).join("\n"),
		);

		expect(elements(editor)).toEqual(lines.map((line) => ["narration", line]));
	});

	it("writes the script after the assets already on the canvas", () => {
		const editor = makeEditor();
		const style = createCanvasNode("asset_style", {
			id: assetId("asset_style"),
			text: "noir",
		});
		editor.children = [style];

		createScriptWriter(editor)("<narration>Snow fell.</narration>");

		expect(editor.children[0]).toBe(style);
		expect(elements(editor)).toEqual([["narration", "Snow fell."]]);
	});

	it("leaves an asset tag the model wrote off the canvas", () => {
		const editor = makeEditor();
		const write = createScriptWriter(editor);

		write(
			'<asset_character name="Ayla">A tall hunter in furs</asset_character>\n',
		);
		write("<narration>Snow fell.</narration>");

		expect(editor.children.map((node) => "type" in node && node.type)).toEqual([
			"narration",
		]);
	});
});
