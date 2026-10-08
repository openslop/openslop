import { Editor, Path, Transforms } from "slate";
import type { ContentType } from "./types";
import {
	createCanvasElement,
	type CreateElementOptions,
} from "./createCanvasElement";

export function insertElement(
	editor: Editor,
	type: ContentType,
	at: Path,
	overrides?: Pick<CreateElementOptions, "attrs" | "text">,
): string {
	const node = createCanvasElement(type, {
		...overrides,
		defaultModels: editor.defaultModels(),
	});
	Transforms.insertNodes(editor, node, { at });
	return node.id;
}
