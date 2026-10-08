import { Editor, Transforms, type Element } from "slate";
import {
	SCENE_TYPE,
	type ContentElement,
	type CanvasEditor,
	type Scene,
} from "@/lib/canvas/types";
import { isScene } from "@/lib/canvas/scenes";

export const content = (
	type: ContentElement["type"],
	id: string = type,
	text = "",
): ContentElement => ({
	id,
	type,
	children: [{ id: `${id}-t`, type, text }],
});

export const scene = (children: ContentElement[], id = "s"): Scene => ({
	id,
	type: SCENE_TYPE,
	children,
});

/** Leaves the editor normalized with a caret, the state plugins assume they run in. */
export function seedScene(editor: CanvasEditor, node: Scene): void {
	Editor.withoutNormalizing(editor, () => {
		Transforms.insertNodes(editor, node);
	});
	Editor.normalize(editor, { force: true });
	Transforms.select(editor, Editor.end(editor, []));
}

/** The element types of each scene, with a root node outside any scene marked `!`. */
export function shape(editor: Editor): string[][] {
	return editor.children.map((s) =>
		isScene(s) ? s.children.map((c) => c.type) : [`!${(s as Element).type}`],
	);
}
