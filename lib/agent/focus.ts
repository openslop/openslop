import { Editor } from "slate";
import { isCanvasElement } from "@/lib/canvas/guards";
import { isScene, sceneIndexOf } from "@/lib/canvas/scenes";
import type { SloppyFocus } from "./types";

export function selectedFocus(editor: Editor): SloppyFocus | undefined {
	if (!editor.selection) return undefined;
	const entry = Editor.above(editor, {
		at: editor.selection.focus,
		match: isCanvasElement,
	});
	if (!entry) return undefined;
	const [element, path] = entry;
	const scene = Editor.above(editor, { at: path, match: isScene });
	return {
		elementId: element.id,
		sceneNumber: scene ? sceneIndexOf(editor.children, scene[0].id) : undefined,
	};
}
