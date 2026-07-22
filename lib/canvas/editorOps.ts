import { Editor, type NodeEntry, type Path, Transforms } from "slate";
import type { CanvasContentElement } from "@/lib/canvas/types";
import { isContentElement } from "./guards";

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
