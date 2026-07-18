import { type Editor, Transforms } from "slate";
import { ReactEditor } from "slate-react";
import { setNodeAttrs } from "@/lib/canvas/editorOps";
import type { CanvasContentElement, CanvasElement } from "@/lib/canvas/types";

/** Merge attrs into a live element's customAttributes (a null value deletes the key). */
export function updateElementAttrs(
	editor: Editor,
	element: CanvasContentElement,
	attrs: Record<string, string | null>,
): void {
	setNodeAttrs(editor, ReactEditor.findPath(editor, element), element, attrs);
}

export function removeElement(editor: Editor, element: CanvasElement): void {
	Transforms.removeNodes(editor, { at: ReactEditor.findPath(editor, element) });
}
