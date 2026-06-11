import { Editor, Transforms } from "slate";
import type { CanvasContentElement } from "@/lib/canvas/types";
import { findNodeById } from "@/app/components/canvas/utils/editorOps";

// A node the preview modified, with a deep clone of its pre-refine content so
// Discard can restore it verbatim.
export type ModifiedSnapshot = { id: string; node: CanvasContentElement };

export const cloneNode = <T>(node: T): T => JSON.parse(JSON.stringify(node));

/**
 * Surgically revert a refine preview: delete the nodes it added and restore the
 * nodes it modified to their pre-refine snapshot. Held-back removals were never
 * applied, so they simply stay. Everything is keyed by node id, so manual edits
 * the user made to OTHER nodes while the preview was up are left untouched
 * (a Cursor-style inline diff — the agent's edits stay editable in between).
 */
export function revertPreview(
	editor: Editor,
	addedIds: string[],
	modified: ModifiedSnapshot[],
): void {
	Editor.withoutNormalizing(editor, () => {
		for (const id of addedIds) {
			const entry = findNodeById(editor, id);
			if (entry) Transforms.removeNodes(editor, { at: entry[1] });
		}
		for (const { id, node } of modified) {
			const entry = findNodeById(editor, id);
			if (!entry) continue;
			Transforms.removeNodes(editor, { at: entry[1] });
			Transforms.insertNodes(editor, node, { at: entry[1] });
		}
	});
}
