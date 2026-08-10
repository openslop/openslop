import {
	Editor,
	Node,
	Text,
	type NodeEntry,
	type Path,
	Transforms,
} from "slate";
import {
	SCENE_TYPE,
	type CanvasContentElement,
	type CanvasElement,
} from "@/lib/canvas/types";
import { withoutCaretMarker, ZERO_WIDTH_SPACE } from "./constants";
import { isCanvasElementType } from "./guards";

/**
 * The canvas is two levels deep — scenes hold content elements, content holds
 * text — so walking it directly yields elements in document order without
 * `Editor.nodes` descending into every text leaf and allocating a path per
 * visit. Id lookups sit on the streaming-sync and drag-over hot paths, where
 * that traversal was the whole cost.
 */
function findCanvasElement(
	editor: Editor,
	match: (node: CanvasElement) => boolean,
): NodeEntry<CanvasElement> | null {
	for (const [index, node] of editor.children.entries()) {
		if (Text.isText(node)) continue;
		if (match(node)) return [node, [index]];
		if (node.type !== SCENE_TYPE) continue;
		for (const [childIndex, child] of node.children.entries()) {
			if (match(child)) return [child, [index, childIndex]];
		}
	}
	return null;
}

/** Any canvas element by id — scenes included. Use {@link findNodeById} when only content will do. */
export function findElementById(
	editor: Editor,
	id: string,
): NodeEntry<CanvasElement> | null {
	return findCanvasElement(editor, (n) => n.id === id);
}

export function findNodeById(
	editor: Editor,
	id: string,
): NodeEntry<CanvasContentElement> | null {
	return findCanvasElement(
		editor,
		(n) => n.id === id && isCanvasElementType(n.type),
	) as NodeEntry<CanvasContentElement> | null;
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
	const currentText = Node.string(Node.get(editor, path));
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
