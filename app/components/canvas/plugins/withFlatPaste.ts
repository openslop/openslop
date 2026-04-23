import type { CanvasEditor } from "../types";
import { isSceneElement } from "../utils/guards";

export const withFlatPaste = (editor: CanvasEditor): CanvasEditor => {
	const { insertFragment } = editor;

	editor.insertFragment = (fragment) => {
		insertFragment(
			fragment.flatMap((n) => (isSceneElement(n) ? n.children : [n])),
		);
	};

	return editor;
};
