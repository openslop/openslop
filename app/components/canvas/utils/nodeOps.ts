import { type Editor, Transforms } from "slate";
import { ReactEditor } from "slate-react";
import {
	applyNodeVersion,
	duplicateNode,
	mergeAttrs,
	retypeNode,
} from "@/lib/canvas/editorOps";
import { parentSceneId, sceneIndexOf } from "@/lib/canvas/scenes";
import type { CanvasContentElement, CanvasElement } from "@/lib/canvas/types";
import type { ConnectorModels } from "@/lib/connectors/models";
import { START_FRAME_ATTR } from "@/lib/connectors/video/startFrame";
import type { ElementVersion } from "@/lib/generation/versions";

/** Merge attrs into a live element's attributes (a null value deletes the key). */
export function updateElementAttrs(
	editor: Editor,
	element: CanvasContentElement,
	attrs: Record<string, string | null>,
): void {
	mergeAttrs(editor, ReactEditor.findPath(editor, element), element, attrs);
}

/** Turns an image into a video opening on its picture, by URL since the image is gone. Returns its scene. */
export function animateElement(
	editor: Editor,
	element: CanvasContentElement,
	picture: string,
	defaultModels?: ConnectorModels,
): number {
	const path = ReactEditor.findPath(editor, element);
	retypeNode(editor, path, element, "video", {
		attrs: { [START_FRAME_ATTR]: picture },
		defaultModels,
	});
	return sceneIndexOf(editor.children, parentSceneId(editor, path));
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
