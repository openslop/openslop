import { describe, expect, it } from "vitest";
import { element, elements, makeEditor } from "@/lib/canvas/__tests__/_assets";
import { flatAttributes } from "@/lib/canvas/element-attributes";
import { isContentElement } from "@/lib/canvas/guards";
import { SCENE_TYPE } from "@/lib/canvas/types";
import { createScriptWriter } from "../script-writer";

describe("createScriptWriter", () => {
	it("grows an element in the document as its text arrives", () => {
		const editor = makeEditor();
		const write = createScriptWriter(editor);

		write("<speech>");
		write("Once upon");
		expect(elements(editor)).toEqual([["speech", "Once upon"]]);

		write(" a time, far away");
		expect(elements(editor)).toEqual([
			["speech", "Once upon a time, far away"],
		]);
	});

	it("replaces the old script even when the first element reuses an old id", () => {
		const editor = makeEditor([
			{
				id: "s1",
				type: SCENE_TYPE,
				children: [
					element("old1", "speech", "Old"),
					element("old2", "speech", "Older"),
				],
			},
		]);

		createScriptWriter(editor)(
			'<speech id="old1">A</speech>\n<speech>B</speech>\n',
		);

		expect(elements(editor)).toEqual([
			["speech", "A"],
			["speech", "B"],
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
		write("<speech>");
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

		write("<image>a wolf</image>\n<speech>");
		expect(elements(editor)).toEqual([["image", "a wolf"]]);

		write("The wolf howled at the moon");
		expect(elements(editor)).toEqual([
			["image", "a wolf"],
			["speech", "The wolf howled at the moon"],
		]);
	});

	it("writes every element of a chunk, however many it carries", () => {
		const editor = makeEditor();
		const lines = ["one", "two", "three", "four", "five"];

		createScriptWriter(editor)(
			lines.map((line) => `<speech>${line}</speech>`).join("\n"),
		);

		expect(elements(editor)).toEqual(lines.map((line) => ["speech", line]));
	});

	it("leaves an asset tag the model wrote off the canvas", () => {
		const editor = makeEditor();
		const write = createScriptWriter(editor);

		write('<asset_avatar name="Ayla">A tall hunter in furs</asset_avatar>\n');
		write("<speech>Snow fell.</speech>");

		expect(editor.children.map((node) => "type" in node && node.type)).toEqual([
			"speech",
		]);
	});
});
