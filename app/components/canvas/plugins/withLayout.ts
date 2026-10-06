import { Transforms } from "slate";
import type { CanvasEditor } from "@/lib/canvas/types";
import { isHeadElement, isTitleElement } from "@/lib/canvas/guards";
import { insertElement } from "@/lib/canvas/insertElement";
import { createTitle } from "@/lib/canvas/title";

/** The canvas always holds a title on top and at least one element under it. */
export const withLayout = (editor: CanvasEditor): CanvasEditor => {
	const { normalizeNode } = editor;

	editor.normalizeNode = ([node, path]) => {
		if (path.length === 0 && !editor.children.some(isTitleElement)) {
			Transforms.insertNodes(editor, createTitle(), { at: [0] });
		}
		if (path.length === 0 && editor.children.every(isHeadElement)) {
			insertElement(editor, "narration", [editor.children.length]);
		}
		return normalizeNode([node, path]);
	};

	return editor;
};
