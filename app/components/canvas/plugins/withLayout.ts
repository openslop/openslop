import type { CanvasEditor } from "@/lib/canvas/types";
import { isAssetElement } from "@/lib/canvas/guards";
import { insertElement } from "@/lib/canvas/insertElement";

/** The canvas always holds at least one element under the assets. */
export const withLayout = (editor: CanvasEditor): CanvasEditor => {
	const { normalizeNode } = editor;

	editor.normalizeNode = ([node, path]) => {
		if (path.length === 0 && editor.children.every(isAssetElement)) {
			insertElement(editor, "narration", [editor.children.length]);
		}
		return normalizeNode([node, path]);
	};

	return editor;
};
