import type { CanvasEditor } from "@/lib/canvas/types";
import { isAssetElement } from "@/lib/canvas/guards";
import { insertElement } from "@/lib/canvas/insert-element";

/** The canvas always holds at least one element under the assets, and a soft break stays inside its element. */
export const withLayout = (editor: CanvasEditor): CanvasEditor => {
	const { normalizeNode } = editor;

	editor.insertSoftBreak = () => editor.insertText("\n");

	editor.normalizeNode = ([node, path]) => {
		if (path.length === 0 && editor.children.every(isAssetElement)) {
			insertElement(editor, "narration", [editor.children.length]);
		}
		return normalizeNode([node, path]);
	};

	return editor;
};
