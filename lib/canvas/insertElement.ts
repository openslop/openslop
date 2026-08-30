import { Editor, Path, Transforms } from "slate";
import type { CanvasElementType } from "@/lib/canvas/types";
import type { ConnectorModels } from "@/lib/connectors/models";
import { createCanvasNode } from "./createCanvasNode";

export function insertElement(
	editor: Editor,
	type: CanvasElementType,
	at: Path,
	overrides?: {
		attrs?: Record<string, string>;
		text?: string;
		projectModels?: ConnectorModels;
	},
): string {
	const node = createCanvasNode(type, overrides);
	Transforms.insertNodes(editor, node, { at });
	return node.id;
}
