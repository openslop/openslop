import { Editor, Path, Transforms } from "slate";
import type { CanvasElementType } from "@/lib/canvas/types";
import type { ConnectorRegistry } from "@/lib/config/ConfigProvider";
import { createCanvasNode } from "./createCanvasNode";

export function insertElement(
	editor: Editor,
	type: CanvasElementType,
	at: Path,
	connectors: ConnectorRegistry,
	overrides?: { attrs?: Record<string, string>; text?: string },
): string {
	const node = createCanvasNode(type, connectors, overrides);
	Transforms.insertNodes(editor, node, { at });
	return node.id;
}
