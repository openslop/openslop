import { Editor, Path, Transforms, type NodeEntry } from "slate";
import { findElementById } from "./editorOps";
import { isSceneElement } from "./scenes";
import type { CanvasElement } from "./types";

/** What a sortable card tells dnd-kit about itself. */
export type SortableData = { type: "scene" | "content"; sceneId: string };

/** The shape dnd-kit hands back for the dragged and the hovered item. */
export type DragEntry = { id: string | number; data: { current?: unknown } };

/** Where an incoming cross-scene drag would land. */
export type DragTransfer = { sceneId: string; atIndex: number };

// dnd-kit hands `data` back untyped; SortableItem is its only author.
const sortableData = (entry: DragEntry) => entry.data.current as SortableData;

/** Content dropped on a scene appends to it; dropped on content, it takes that slot. */
function contentSlot([node, path]: NodeEntry<CanvasElement>): Path {
	return isSceneElement(node) ? [...path, node.children.length] : path;
}

/**
 * Where a dragged element lands when dropped on `overId`. Scenes reorder among
 * scenes (dropping on content targets its parent scene). No-ops when either id
 * is gone or a scene is already in the target slot.
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

	Transforms.moveNodes(editor, { at: activePath, to: contentSlot(overEntry) });
}

/**
 * The slot content would take if dropped on `over` in another scene. Null while
 * the drag is a scene, stays in its own scene, or hovers something unknown.
 */
export function crossSceneTransfer(
	editor: Editor,
	active: DragEntry,
	over: DragEntry,
): DragTransfer | null {
	const from = sortableData(active);
	const to = sortableData(over);
	if (from.type === "scene" || from.sceneId === to.sceneId) return null;
	const overEntry = findElementById(editor, String(over.id));
	if (!overEntry) return null;
	const slot = contentSlot(overEntry);
	return { sceneId: to.sceneId, atIndex: slot[slot.length - 1] };
}
