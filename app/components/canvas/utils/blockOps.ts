import { type Editor, Transforms } from "slate";
import { ReactEditor } from "slate-react";
import { duplicateElementAt } from "@/lib/canvas/editorOps";
import type { ContentElement, CanvasBlock } from "@/lib/canvas/types";

/** Inserts a copy of a live element directly after it. Returns the copy's id. */
export function duplicateElement(
	editor: Editor,
	element: ContentElement,
): string {
	return duplicateElementAt(
		editor,
		element,
		ReactEditor.findPath(editor, element),
	);
}

export function removeBlock(editor: Editor, block: CanvasBlock): void {
	Transforms.removeNodes(editor, { at: ReactEditor.findPath(editor, block) });
}
