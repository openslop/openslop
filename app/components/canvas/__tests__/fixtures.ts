import { Editor, Transforms } from "slate";
import {
	SCENE_TYPE,
	type CanvasContentElement,
	type CanvasEditor,
	type SceneElement,
} from "@/lib/canvas/types";

export const content = (
	type: CanvasContentElement["type"],
	id: string = type,
	text = "",
): CanvasContentElement => ({
	id,
	type,
	children: [{ id: `${id}-t`, type, text }],
});

export const scene = (
	children: CanvasContentElement[],
	id = "s",
): SceneElement => ({ id, type: SCENE_TYPE, children });

/** Leaves the editor normalized with a caret, the state plugins assume they run in. */
export function seedScene(editor: CanvasEditor, node: SceneElement): void {
	Editor.withoutNormalizing(editor, () => {
		Transforms.insertNodes(editor, node);
	});
	Editor.normalize(editor, { force: true });
	Transforms.select(editor, Editor.end(editor, []));
}
