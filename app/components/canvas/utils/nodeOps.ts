import { type Editor, Transforms } from "slate";
import { ReactEditor } from "slate-react";
import { duplicateNode } from "@/lib/canvas/editorOps";
import type { CanvasContentElement, CanvasElement } from "@/lib/canvas/types";

/** Inserts a copy of a live element directly after it. Returns the copy's id. */
export function duplicateElement(
	editor: Editor,
	element: CanvasContentElement,
): string {
	return duplicateNode(editor, element, ReactEditor.findPath(editor, element));
}

export function removeElement(editor: Editor, element: CanvasElement): void {
	Transforms.removeNodes(editor, { at: ReactEditor.findPath(editor, element) });
}
