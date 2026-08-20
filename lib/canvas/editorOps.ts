import { Editor, Element, type NodeEntry, Path, Transforms } from "slate";
import type { CanvasContentElement, CanvasElement } from "@/lib/canvas/types";
import { withoutCaretMarker, ZERO_WIDTH_SPACE } from "./constants";
import { isContentElement } from "./guards";
import { isSceneElement } from "./scenes";
import { makeNodeId } from "./nodeUtils";

/**
 * Any canvas element by id — scenes included. Use {@link findNodeById} when only
 * content will do.
 *
 * Elements only ever sit at the top level or one scene down, so this walks those
 * two levels instead of a generic Slate traversal, which descends into every
 * text leaf in the document before it can rule one out.
 */
export function findElementById(
	editor: Editor,
	id: string,
): NodeEntry<CanvasElement> | null {
	const nodes = editor.children;
	for (let i = 0; i < nodes.length; i++) {
		const node = nodes[i];
		if (!Element.isElement(node)) continue;
		if (node.id === id) return [node, [i]];
		if (!isSceneElement(node)) continue;
		for (let j = 0; j < node.children.length; j++) {
			const child = node.children[j];
			if (child.id === id) return [child, [i, j]];
		}
	}
	return null;
}

export function findNodeById(
	editor: Editor,
	id: string,
): NodeEntry<CanvasContentElement> | null {
	const entry = findElementById(editor, id);
	if (!entry) return null;
	const [node, path] = entry;
	return isContentElement(node) ? [node, path] : null;
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

/** Inserts a copy of the node at `at`, with fresh ids, right after it. Returns the copy's id. */
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
 * Diff-based text update: compares current text to newText and applies minimal
 * Transforms. If newText is a prefix extension, appends the diff. Otherwise,
 * replaces the full text range.
 *
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
 * Merge attrs into element's customAttributes. Keys with null values are
 * deleted from the result.
 */
export function setNodeAttrs(
	editor: Editor,
	path: Path,
	element: CanvasContentElement,
	attrs: Record<string, string | null>,
): void {
	const merged = { ...element.customAttributes };
	for (const [key, value] of Object.entries(attrs)) {
		if (value === null) {
			delete merged[key];
		} else {
			merged[key] = value;
		}
	}
	Transforms.setNodes(editor, { customAttributes: merged }, { at: path });
}
