import { Editor, Element, type NodeEntry, type Path, Transforms } from "slate";
import type { CanvasContentElement, CanvasElement } from "@/lib/canvas/types";
import { isContentElement } from "./guards";
import { isSceneElement } from "./scenes";

/**
 * Canvas elements only ever live at two depths: scenes are the editor's
 * children and content elements are theirs. Walking those levels directly
 * keeps lookups off the whole-document traversal `Editor.nodes` performs,
 * which matters because these run per streamed token and per drag-over frame.
 */
function findEntry<T extends CanvasElement>(
	editor: Editor,
	match: (node: CanvasElement) => node is T,
): NodeEntry<T> | null {
	const scenes = editor.children;
	for (let i = 0; i < scenes.length; i++) {
		const node = scenes[i];
		if (!Element.isElement(node)) continue;
		if (match(node)) return [node, [i]];
		if (!isSceneElement(node)) continue;
		for (let j = 0; j < node.children.length; j++) {
			const child = node.children[j];
			if (match(child)) return [child, [i, j]];
		}
	}
	return null;
}

/** Any canvas element by id — scenes included. Use {@link findNodeById} when only content will do. */
export function findElementById(
	editor: Editor,
	id: string,
): NodeEntry<CanvasElement> | null {
	return findEntry(editor, (node): node is CanvasElement => node.id === id);
}

export function findNodeById(
	editor: Editor,
	id: string,
): NodeEntry<CanvasContentElement> | null {
	return findEntry(
		editor,
		(node): node is CanvasContentElement =>
			isContentElement(node) && node.id === id,
	);
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
