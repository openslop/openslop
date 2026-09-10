import { Node } from "slate";
import { ReactEditor } from "slate-react";
import type { CanvasEditor } from "@/lib/canvas/types";
import {
	assignIdRecursively,
	makeNodeId,
	stripIds,
} from "@/lib/canvas/nodeUtils";

export const withNodeId = (editor: ReactEditor): CanvasEditor => {
	const { apply, insertFragment } = editor;

	editor.insertFragment = (fragment) => {
		insertFragment(fragment.map(stripIds));
	};

	editor.apply = (operation) => {
		if (operation.type === "insert_node") assignIdRecursively(operation.node);
		// A history replay carries the id it minted the first time; keep it.
		if (
			operation.type === "split_node" &&
			operation.properties.id === Node.get(editor, operation.path).id
		)
			operation.properties.id = makeNodeId();
		return apply(operation);
	};

	return editor;
};
