import type { CanvasEditor } from "@/lib/canvas/types";
import { isScene } from "@/lib/canvas/scenes";

export const withFlatPaste = (editor: CanvasEditor): CanvasEditor => {
	const { insertFragment } = editor;

	editor.insertFragment = (fragment) => {
		insertFragment(fragment.flatMap((n) => (isScene(n) ? n.children : [n])));
	};

	return editor;
};
