import mapValues from "lodash/mapValues";
import { Editor, Element, type NodeEntry, Path, Transforms } from "slate";
import type { CanvasContentElement, CanvasElement } from "@/lib/canvas/types";
import { flatAttributes, splitAttributes } from "@/lib/video/elementAttributes";
import { withoutCaretMarker, ZERO_WIDTH_SPACE } from "./constants";
import { isContentElement } from "./guards";
import { makeNodeId } from "./nodeUtils";

/** Any canvas element by id — scenes included. Use {@link findNodeById} when only content will do. */
export function findElementById(
	editor: Editor,
	id: string,
): NodeEntry<CanvasElement> | null {
	const [entry] = Editor.nodes<CanvasElement>(editor, {
		at: [],
		match: (n) => Element.isElement(n) && n.id === id,
	});
	return entry ?? null;
}

export function findNodeById(
	editor: Editor,
	id: string,
): NodeEntry<CanvasContentElement> | null {
	const [entry] = Editor.nodes<CanvasContentElement>(editor, {
		at: [],
		match: (n) => isContentElement(n) && n.id === id,
	});
	return entry ?? null;
}

/**
 * Empties the document. Normalization puts the blank first element back, so
 * what streams in next lands on its own rather than under what was there.
 */
export function clearEditor(editor: Editor): void {
	Transforms.removeNodes(editor, {
		at: [],
		match: (_node, path) => path.length === 1,
	});
}

export function duplicateNode(
	editor: Editor,
	element: CanvasContentElement,
	at: Path,
): string {
	const copy: CanvasContentElement = {
		...element,
		id: makeNodeId(),
		children: element.children.map((child) => ({
			...child,
			id: makeNodeId(),
		})),
	};
	Transforms.insertNodes(editor, copy, { at: Path.next(at) });
	return copy.id;
}

/**
 * Takes body text: the deletion-guard marker is owned here, not by callers. The
 * full-range replace below spans the marker leaf, so writing raw text would drop
 * the guard and leave a cleared element looking non-empty.
 */
export function updateNodeText(
	editor: Editor,
	path: Path,
	newText: string,
): void {
	const currentText = Editor.string(editor, path);
	const nextText = ZERO_WIDTH_SPACE + withoutCaretMarker(newText);
	if (currentText === nextText) return;

	if (nextText.startsWith(currentText)) {
		Transforms.insertText(editor, nextText.slice(currentText.length), {
			at: Editor.end(editor, path),
		});
		return;
	}
	Transforms.insertText(editor, nextText, {
		at: Editor.range(editor, path),
	});
}

/**
 * Replaces what the generator sees, leaving the element's layout alone.
 */
export function replaceGenerationAttrs(
	editor: Editor,
	path: Path,
	attributes: Record<string, string | number>,
): void {
	Transforms.setNodes(
		editor,
		{ generationAttributes: mapValues(attributes, String) },
		{ at: path },
	);
}

/**
 * Merge attrs into the element's attributes, each landing in its own bucket.
 * Keys with null values are deleted from the result.
 */
export function mergeAttrs(
	editor: Editor,
	path: Path,
	element: CanvasContentElement,
	attrs: Record<string, string | null>,
): void {
	const merged = flatAttributes(element);
	for (const [key, value] of Object.entries(attrs)) {
		if (value === null) {
			delete merged[key];
		} else {
			merged[key] = value;
		}
	}
	Transforms.setNodes(editor, splitAttributes(merged), { at: path });
}
