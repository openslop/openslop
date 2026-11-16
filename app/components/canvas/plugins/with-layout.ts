import type { CanvasEditor } from "@/lib/canvas/types";
import { ZERO_WIDTH_SPACE } from "@/lib/canvas/constants";
import { isAssetElement } from "@/lib/canvas/guards";
import { insertElement } from "@/lib/canvas/insert-element";

/** The canvas always holds at least one element under the assets, and a soft break stays inside its element. */
export const withLayout = (editor: CanvasEditor): CanvasEditor => {
	const { normalizeNode } = editor;

	// Chrome can't place a caret after a newline followed by a void element (e.g. character chip)
	editor.insertSoftBreak = () => editor.insertText(`\n${ZERO_WIDTH_SPACE}`);

	editor.normalizeNode = ([node, path]) => {
		if (path.length === 0 && editor.children.every(isAssetElement)) {
			insertElement(editor, "speech", [editor.children.length]);
		}
		return normalizeNode([node, path]);
	};

	return editor;
};
