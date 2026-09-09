import { Editor } from "slate";
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
		if (operation.type === "split_node") {
			const [source] = Editor.node(editor, operation.path);
			const sourceId = (source as { id?: string } | undefined)?.id;
			if (!sourceId || operation.properties.id === sourceId)
				operation.properties.id = makeNodeId();
		}
		return apply(operation);
	};

	return editor;
};
