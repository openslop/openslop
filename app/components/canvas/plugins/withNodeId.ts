import { ReactEditor } from "slate-react";
import type { CanvasEditor } from "@/lib/canvas/types";
import {
	assignIdRecursively,
	isNodeIdTaken,
	makeNodeId,
	stripIds,
} from "@/lib/canvas/nodeUtils";

export const withNodeId = (editor: ReactEditor): CanvasEditor => {
	const { apply, insertFragment } = editor;

	editor.insertFragment = (fragment) => {
		insertFragment(fragment.map(stripIds));
	};

	editor.apply = (operation) => {
		if (operation.type === "insert_node") {
			assignIdRecursively(operation.node);
			return apply(operation);
		}

		// A split copies the original node's properties onto the new half, so it
		// needs a fresh id. History replays the inverse of a merge as a split
		// carrying the merged-away node's id, which is free again — reusing it
		// keeps the element's generated assets attached across undo.
		if (operation.type === "split_node") {
			const { id } = operation.properties;
			if (typeof id !== "string" || isNodeIdTaken(editor, id)) {
				operation.properties.id = makeNodeId();
			}
			return apply(operation);
		}

		return apply(operation);
	};

	return editor;
};
