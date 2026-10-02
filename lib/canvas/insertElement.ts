import { Editor, Path, Transforms } from "slate";
import type { CanvasElementType } from "./types";
import { createCanvasNode, type CreateNodeOptions } from "./createCanvasNode";

export function insertElement(
	editor: Editor,
	type: CanvasElementType,
	at: Path,
	overrides?: Pick<CreateNodeOptions, "attrs" | "text">,
): string {
	const node = createCanvasNode(type, {
		...overrides,
		defaultModels: editor.defaultModels(),
	});
	Transforms.insertNodes(editor, node, { at });
	return node.id;
}
