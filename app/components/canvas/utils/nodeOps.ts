import { type Editor, Transforms } from "slate";
import { ReactEditor } from "slate-react";
import {
	applyNodeVersion,
	duplicateNode,
	mergeAttrs,
} from "@/lib/canvas/editorOps";
import type { CanvasContentElement, CanvasElement } from "@/lib/canvas/types";
import type { ElementVersion } from "@/lib/generation/versions";

/** Merge attrs into a live element's attributes (a null value deletes the key). */
export function updateElementAttrs(
	editor: Editor,
	element: CanvasContentElement,
	attrs: Record<string, string | null>,
): void {
	mergeAttrs(editor, ReactEditor.findPath(editor, element), element, attrs);
}

/** Restore a live element to the state a version was generated from. */
export function applyElementVersion(
	editor: Editor,
	element: CanvasContentElement,
	version: Pick<ElementVersion, "elementType" | "inputs">,
): void {
	applyNodeVersion(editor, ReactEditor.findPath(editor, element), version);
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
