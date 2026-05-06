import { Editor, type NodeEntry, type Path, Transforms } from "slate";
import type { CanvasContentElement } from "../types";
import { isContentElement, isSceneElement } from "./guards";

/**
 * Find a content element by ID. Returns [node, path] or null.
 *
 * The canvas tree is a fixed two-level shape (root → scenes → content), so
 * we scan it directly instead of paying for `Editor.nodes`' generator
 * traversal — meaningfully cheaper when called in a tight loop (script
 * streaming, refine ops).
 */
export function findNodeById(
	editor: Editor,
	id: string,
): NodeEntry<CanvasContentElement> | null {
	const root = editor.children;
	for (let i = 0; i < root.length; i++) {
		const scene = root[i];
		if (!isSceneElement(scene)) continue;
		const kids = scene.children;
		for (let j = 0; j < kids.length; j++) {
			const child = kids[j];
			if (isContentElement(child) && child.id === id) {
				return [child, [i, j]];
			}
		}
	}
	return null;
}

/** Build an O(1) id → entry index over all content elements in the editor. */
export function buildContentNodeIndex(
	editor: Editor,
): Map<string, NodeEntry<CanvasContentElement>> {
	const index = new Map<string, NodeEntry<CanvasContentElement>>();
	const root = editor.children;
	for (let i = 0; i < root.length; i++) {
		const scene = root[i];
		if (!isSceneElement(scene)) continue;
		const kids = scene.children;
		for (let j = 0; j < kids.length; j++) {
			const child = kids[j];
			if (isContentElement(child)) {
				index.set(child.id, [child, [i, j]]);
			}
		}
	}
	return index;
}

/**
 * Diff-based text update: compares current text to newText and applies minimal
 * Transforms. If newText is a prefix extension, appends the diff. Otherwise,
 * replaces the full text range.
 */
export function updateNodeText(
	editor: Editor,
	path: Path,
	newText: string,
): void {
	const currentText = Editor.string(editor, path);
	if (currentText === newText) return;

	if (newText.startsWith(currentText)) {
		const diff = newText.substring(currentText.length);
		if (diff) {
			Transforms.insertText(editor, diff, {
				at: Editor.end(editor, path),
			});
		}
	} else {
		const range = Editor.range(editor, path);
		Transforms.insertText(editor, newText, { at: range });
	}
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
