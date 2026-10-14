import { describe, expect, it } from "vitest";
import { createEditor, Editor, Transforms } from "slate";
import { withReact } from "slate-react";
import { insertCharacterRef, mentionAt } from "@/lib/canvas/character-refs";
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
});
