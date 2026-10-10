import { describe, expect, it } from "vitest";
import { element, elements, makeEditor } from "@/lib/canvas/__tests__/_assets";
import { flatAttributes } from "@/lib/canvas/elementAttributes";
import { isContentElement } from "@/lib/canvas/guards";
import { SCENE_TYPE } from "@/lib/canvas/types";
import { createScriptWriter } from "../scriptWriter";

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

	it("replaces the old script even when the first element reuses an old id", () => {
		const editor = makeEditor([
			{
				id: "s1",
				type: SCENE_TYPE,
				children: [
					element("old1", "narration", "Old"),
					element("old2", "narration", "Older"),
				],
			},
		]);

		createScriptWriter(editor)(
			'<narration id="old1">A</narration>\n<narration>B</narration>\n',
		);

		expect(elements(editor)).toEqual([
			["narration", "A"],
			["narration", "B"],
		]);
	});

	it("starts a streamed element on the editor's default model", () => {
		const pinned = { provider: "runware", model: "Seedream 5 Lite" } as const;
		const editor = makeEditor([], { image: pinned });

		createScriptWriter(editor)("<image>A forest</image>\n");

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

	it("leaves an asset tag the model wrote off the canvas", () => {
		const editor = makeEditor();
		const write = createScriptWriter(editor);

		write('<asset_avatar name="Ayla">A tall hunter in furs</asset_avatar>\n');
		write("<narration>Snow fell.</narration>");

		expect(editor.children.map((node) => "type" in node && node.type)).toEqual([
			"narration",
		]);
	});
});
