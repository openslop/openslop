import { Editor, Path, Transforms } from "slate";
import type { CanvasElementType } from "@/lib/canvas/types";
import { createCanvasNode, type CreateNodeOptions } from "./createCanvasNode";

export function insertElement(
	editor: Editor,
	type: CanvasElementType,
	at: Path,
	overrides?: Omit<CreateNodeOptions, "id">,
): string {
	const node = createCanvasNode(type, overrides);
	Transforms.insertNodes(editor, node, { at });
	return node.id;
}
