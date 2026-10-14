import { describe, expect, it } from "vitest";
import { Editor, Transforms } from "slate";
import { mentionAt } from "../character-refs";
import { SCENE_TYPE, type ContentElement } from "../types";
import { element, makeEditor } from "./_assets";

const caretAtEnd = (content: ContentElement) => {
	const editor = makeEditor([
		{ id: "s", type: SCENE_TYPE, children: [content] },
	]);
	Transforms.select(editor, Editor.end(editor, []));
	return editor;
};

describe("mentionAt", () => {
	it("finds the @ before the caret in a visual, with what is typed after it", () => {
		const editor = caretAtEnd(element("i", "image", "A field with @Gr"));

		expect(mentionAt(editor)).toEqual({
			query: "Gr",
			range: {
				anchor: { path: [0, 0, 0], offset: 13 },
				focus: { path: [0, 0, 0], offset: 16 },
			},
		});
	});

	it("finds a bare @, before anything is typed after it", () => {
		const editor = caretAtEnd(element("i", "image", "A field with @"));

		expect(mentionAt(editor)?.query).toBe("");
	});

	it.each([
		["speech", element("n", "narration", "Mail me @Gr")],
		["an @ inside a word", element("i", "image", "me@Gr")],
	])("finds nothing in %s", (_, content) => {
		expect(mentionAt(caretAtEnd(content))).toBeUndefined();
	});

	it("finds nothing with the caret inside a word", () => {
		const editor = caretAtEnd(element("i", "image", "A field with @Granny"));
		Transforms.move(editor, { distance: 3, reverse: true });

		expect(mentionAt(editor)).toBeUndefined();
	});
});
