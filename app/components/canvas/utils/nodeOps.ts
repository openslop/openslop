import { type Editor, Transforms } from "slate";
import { ReactEditor } from "slate-react";
import {
	duplicateNode,
	setGenerationAttrs,
	setNodeAttrs,
	updateNodeText,
} from "@/lib/canvas/editorOps";
import type { CanvasContentElement, CanvasElement } from "@/lib/canvas/types";
import type { NodeInputs } from "@/lib/generation/inputs";

/** Merge attrs into a live element's attributes (a null value deletes the key). */
export function updateElementAttrs(
	editor: Editor,
	element: CanvasContentElement,
	attrs: Record<string, string | null>,
): void {
	setNodeAttrs(editor, ReactEditor.findPath(editor, element), element, attrs);
}

export function applyNodeInputs(
	editor: Editor,
	element: CanvasContentElement,
	inputs: NodeInputs,
): void {
	const path = ReactEditor.findPath(editor, element);
	setGenerationAttrs(editor, path, inputs.attributes);
	updateNodeText(editor, path, inputs.prompt);
}

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
