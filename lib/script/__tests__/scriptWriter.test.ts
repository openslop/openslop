import { describe, expect, it } from "vitest";
import { createEditor, type Editor } from "slate";
import { isContentElement } from "@/lib/canvas/guards";
import { getElementBodyText } from "@/lib/canvas/osmlSerializer";
import { createProjectStore } from "@/lib/project/store";
import { createScriptWriter } from "../scriptWriter";

const makeCanvas = () => ({
	editor: createEditor(),
	store: createProjectStore(),
	defaultModels: () => ({}),
});

const elements = (editor: Editor): [type: string, text: string][] =>
	editor.children
		.filter(isContentElement)
		.map((element) => [element.type, getElementBodyText(element)]);

describe("createScriptWriter", () => {
	it("grows an element in the document as its text arrives", () => {
		const canvas = makeCanvas();
		const write = createScriptWriter(canvas);

		write("<narration>");
		write("Once upon");
		expect(elements(canvas.editor)).toEqual([["narration", "Once upon"]]);

		write(" a time, far away");
		expect(elements(canvas.editor)).toEqual([
			["narration", "Once upon a time, far away"],
		]);
	});

	it("writes later text through the editor, never into the node it inserted", () => {
		const canvas = makeCanvas();
		const write = createScriptWriter(canvas);
		write("<narration>");
		write("Once upon");
		const inserted = canvas.editor.children[0];

		write(" a time, far away");

		expect(canvas.editor.children[0]).not.toBe(inserted);
		expect(inserted).toMatchObject({
			children: [{}, { text: "Once upon" }],
		});
	});

	it("holds an element back until it has text", () => {
		const canvas = makeCanvas();
		const write = createScriptWriter(canvas);

		write("<image>a wolf</image>\n<narration>");
		expect(elements(canvas.editor)).toEqual([["image", "a wolf"]]);

		write("The wolf howled at the moon");
		expect(elements(canvas.editor)).toEqual([
			["image", "a wolf"],
			["narration", "The wolf howled at the moon"],
		]);
	});

	it("writes every element of a chunk, however many it carries", () => {
		const canvas = makeCanvas();
		const lines = ["one", "two", "three", "four", "five"];

		createScriptWriter(canvas)(
			lines.map((line) => `<narration>${line}</narration>`).join("\n"),
		);

		expect(elements(canvas.editor)).toEqual(
			lines.map((line) => ["narration", line]),
		);
	});

	it("patches the project from metadata tags and keeps them off the canvas", () => {
		const canvas = makeCanvas();
		const write = createScriptWriter(canvas);

		write("<metadata_title>The Wolf</metadata_title>\n");
		write('<metadata_character name="Ayla" gender="feminine">A tall ');
		write("hunter in furs</metadata_character>\n");
		write("<narration>Snow fell.</narration>");

		const { metadata } = canvas.store.getState();
		expect(metadata.title).toBe("The Wolf");
		expect(metadata.characters.Ayla).toMatchObject({
			appearance: "A tall hunter in furs",
			gender: "feminine",
		});
		expect(elements(canvas.editor)).toEqual([["narration", "Snow fell."]]);
	});
});
