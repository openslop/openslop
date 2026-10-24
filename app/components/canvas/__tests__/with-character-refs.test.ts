import { describe, expect, it } from "vitest";
import { createEditor, Editor, Text, Transforms } from "slate";
import { withReact } from "slate-react";
import { insertCharacterRef, mentionAt } from "@/lib/canvas/character-refs";
import { ZERO_WIDTH_SPACE } from "@/lib/canvas/constants";
import { retypeElement, updateElementText } from "@/lib/canvas/editor-ops";
import { isCharacterRef } from "@/lib/canvas/guards";
import { getElementBodyText } from "@/lib/canvas/osml-serializer";
import { getContentElements } from "@/lib/canvas/scenes";
import type { CanvasEditor, ContentElement } from "@/lib/canvas/types";
import { withCharacterRefs } from "../plugins/with-character-refs";
import { content, scene, seedScene } from "./fixtures";

const editorWith = (element: ContentElement): CanvasEditor => {
	const editor = withCharacterRefs(withReact(createEditor()));
	editor.defaultModels = () => ({});
	seedScene(editor, scene([element]));
	return editor;
};

const only = (editor: CanvasEditor) => {
	const [element] = getContentElements(editor.children);
	if (!element) throw new Error("no element");
	return element;
};

const refNames = (editor: CanvasEditor) =>
	only(editor).children.flatMap((child) =>
		isCharacterRef(child) ? [child.name] : [],
	);

const mention = (editor: CanvasEditor) => {
	const found = mentionAt(editor);
	if (!found) throw new Error("no mention at the caret");
	return found;
};

describe("withCharacterRefs", () => {
	it("makes each {{Name}} in a visual's prompt a chip, keeping the prompt's text", () => {
		const prompt = "{{Red}} hands a basket to {{Granny}}";
		const editor = editorWith(content("image", "i", prompt));

		expect(refNames(editor)).toEqual(["Red", "Granny"]);
		expect(getElementBodyText(only(editor))).toBe(prompt);
	});

	it("leaves braces in speech as text", () => {
		const editor = editorWith(content("narration", "n", "Hi {{Red}}"));

		expect(refNames(editor)).toEqual([]);
	});

	it("names a character plainly once their visual becomes speech", () => {
		const editor = editorWith(content("image", "i", "Hi {{Red}}!"));

		retypeElement(editor, [0, 0], only(editor), "narration");

		expect(refNames(editor)).toEqual([]);
		expect(getElementBodyText(only(editor))).toBe("Hi Red!");
	});

	it("makes a chip only once a streamed name closes", () => {
		const editor = editorWith(content("video", "v", ""));

		updateElementText(editor, "v", "Shot 1: {{Re");
		expect(refNames(editor)).toEqual([]);

		updateElementText(editor, "v", "Shot 1: {{Red}} runs");
		expect(refNames(editor)).toEqual(["Red"]);
		expect(getElementBodyText(only(editor))).toBe("Shot 1: {{Red}} runs");
	});

	it("keeps the chips when the prompt is rewritten as text", () => {
		const editor = editorWith(content("image", "i", "{{Red}} waves"));

		updateElementText(editor, "i", "{{Wolf}} waves back");

		expect(refNames(editor)).toEqual(["Wolf"]);
	});
});

describe("an @ mention", () => {
	it("swaps the typed @ for a chip and puts the caret past it", () => {
		const editor = editorWith(content("image", "i", "A field with @Gr"));

		insertCharacterRef(editor, mention(editor), "Granny");
		Transforms.insertText(editor, " smiling");

		expect(refNames(editor)).toEqual(["Granny"]);
		expect(getElementBodyText(only(editor))).toBe(
			"A field with {{Granny}} smiling",
		);
		expect(Editor.above(editor, { match: isCharacterRef })).toBeUndefined();
	});

	it.each([
		["A field with (@)", "A field with ({{Granny}})"],
		["@'s basket", "{{Granny}}'s basket"],
	])(
		"keeps the text after the caret next to the chip in %s",
		(prompt, text) => {
			const editor = editorWith(content("image", "i", prompt));
			Transforms.select(editor, {
				path: [0, 0, 0],
				offset: prompt.indexOf("@") + 1,
			});

			insertCharacterRef(editor, mention(editor), "Granny");

			expect(refNames(editor)).toEqual(["Granny"]);
			expect(getElementBodyText(only(editor))).toBe(text);
		},
	);
});

/** The text of the leaf right before the element's first chip. */
const leafBeforeChip = (editor: CanvasEditor) => {
	const { children } = only(editor);
	const before = children[children.findIndex(isCharacterRef) - 1];
	if (!before || !Text.isText(before)) throw new Error("no leaf before a chip");
	return before.text;
};

const caretBeforeChip = (editor: CanvasEditor) => {
	const index = only(editor).children.findIndex(isCharacterRef);
	Transforms.select(editor, Editor.end(editor, [0, 0, index - 1]));
};

describe("a chip that starts a line", () => {
	it("keeps a caret spot between the soft break and the chip", () => {
		const editor = editorWith(content("image", "i", "foo\n{{Red}}"));

		expect(leafBeforeChip(editor)).toBe(`foo\n${ZERO_WIDTH_SPACE}`);
		expect(getElementBodyText(only(editor))).toBe("foo\n{{Red}}");
	});

	it("puts text typed before the chip on the chip's line", () => {
		const editor = editorWith(content("image", "i", "foo\n{{Red}}"));

		caretBeforeChip(editor);
		Transforms.insertText(editor, "x");

		expect(getElementBodyText(only(editor))).toBe("foo\nx{{Red}}");
	});

	it("gets the caret spot when a soft break is typed right before a chip", () => {
		const editor = editorWith(content("image", "i", "foo {{Red}}"));

		caretBeforeChip(editor);
		Transforms.insertText(editor, "\n");

		expect(leafBeforeChip(editor)).toBe(`foo \n${ZERO_WIDTH_SPACE}`);
		expect(getElementBodyText(only(editor))).toBe("foo \n{{Red}}");
	});

	it("leaves a chip in the middle of a line alone", () => {
		const editor = editorWith(content("image", "i", "foo {{Red}}"));

		expect(leafBeforeChip(editor)).toBe("foo ");
	});

	it("joins the lines with one backspace at the start of the chip's line", () => {
		const editor = editorWith(content("image", "i", "foo\n{{Red}}"));

		caretBeforeChip(editor);
		editor.deleteBackward("character");

		expect(leafBeforeChip(editor)).toBe("foo");
		expect(getElementBodyText(only(editor))).toBe("foo{{Red}}");
	});

	it("drops the caret spot once the soft break before the chip is deleted", () => {
		const editor = editorWith(content("image", "i", "foo\n{{Red}}"));

		Transforms.delete(editor, { at: { path: [0, 0, 0], offset: 3 } });

		expect(leafBeforeChip(editor)).toBe("foo");
	});

	it("drops the caret spot between two chips once the break is deleted", () => {
		const editor = editorWith(content("image", "i", "{{Red}}\n{{Wolf}}"));

		const between = [0, 0, 2];
		expect(Editor.string(editor, between)).toBe(`\n${ZERO_WIDTH_SPACE}`);
		Transforms.delete(editor, { at: { path: between, offset: 0 } });

		expect(Editor.string(editor, between)).toBe("");
		expect(refNames(editor)).toEqual(["Red", "Wolf"]);
	});

	it("drops the caret spot once the chip after it is deleted", () => {
		const editor = editorWith(content("image", "i", "foo\n{{Red}} bar"));

		Transforms.removeNodes(editor, { at: [0, 0, 1] });

		expect(Editor.string(editor, [0, 0])).toBe("foo\n bar");
	});
});
