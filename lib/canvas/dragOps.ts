import { Editor, Path, Transforms } from "slate";
import { findElementById } from "./editorOps";
import { isSceneElement } from "./scenes";

/**
 * Where a dragged element lands when dropped on `overId`. Scenes reorder among
 * scenes (dropping on content targets its parent scene); content dropped on a
 * scene appends to that scene, and content dropped on content takes its slot.
 * No-ops when either id is gone or a scene is already in the target slot.
 */
export function moveDraggedElement(
	editor: Editor,
	activeId: string,
	overId: string,
): void {
	const activeEntry = findElementById(editor, activeId);
	const overEntry = findElementById(editor, overId);
	if (!activeEntry || !overEntry) return;

	const [activeNode, activePath] = activeEntry;
	const [overNode, overPath] = overEntry;

	if (isSceneElement(activeNode)) {
		const to = isSceneElement(overNode) ? overPath : Path.parent(overPath);
		if (Path.equals(activePath, to)) return;
		Transforms.moveNodes(editor, { at: activePath, to });
		return;
	}

	const to = isSceneElement(overNode)
		? [...overPath, overNode.children.length]
		: overPath;
	Transforms.moveNodes(editor, { at: activePath, to });
}
