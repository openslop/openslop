import type { CanvasEditor } from "@/lib/canvas/types";
import { insertElement } from "@/lib/canvas/insertElement";

export const withLayout = (editor: CanvasEditor): CanvasEditor => {
	const { normalizeNode } = editor;

	editor.normalizeNode = ([node, path]) => {
		if (path.length === 0 && editor.children.length < 1) {
			insertElement(editor, "narration", [0]);
		}
		return normalizeNode([node, path]);
	};

	return editor;
};
