import { Editor, Path, Transforms } from "slate";
import {
	findNodeById,
	setNodeAttrs,
	updateNodeText,
} from "@/lib/canvas/editorOps";
import { insertElement } from "@/lib/canvas/insertElement";
import { createCanvasNode } from "@/lib/canvas/createCanvasNode";
import { preservedAttributes } from "@/lib/canvas/preservedAttributes";
import type { ConnectorRegistry } from "@/lib/config/ConfigProvider";
import type { RefineOp } from "./types";

export function applyRefineOp(
	editor: Editor,
	op: RefineOp,
	anchorMap: Record<string, string>,
	connectors: ConnectorRegistry,
): void {
	Editor.withoutNormalizing(editor, () => {
		switch (op.op) {
			case "insert":
				applyInsert(editor, op, anchorMap, connectors);
				break;
			case "remove":
				applyRemove(editor, op);
				break;
			case "set":
				applySet(editor, op, connectors);
				break;
		}
	});
}

function resolveInsertPath(
	editor: Editor,
	op: Extract<RefineOp, { op: "insert" }>,
	anchorMap: Record<string, string>,
): Path {
	if (!op.anchor_id) {
		return op.position === "before" ? [0, 0] : [editor.children.length];
	}

	const resolvedId = anchorMap[op.anchor_id] ?? op.anchor_id;
	const entry =
		findNodeById(editor, resolvedId) ?? findNodeById(editor, op.anchor_id);
	if (!entry) return [editor.children.length];

	return op.position === "before" ? entry[1] : Path.next(entry[1]);
}

function applyInsert(
	editor: Editor,
	op: Extract<RefineOp, { op: "insert" }>,
	anchorMap: Record<string, string>,
	connectors: ConnectorRegistry,
): void {
	const at = resolveInsertPath(editor, op, anchorMap);
	const id = insertElement(editor, op.type, at, connectors, {
		attrs: op.attrs,
		text: op.text,
	});

	if (op.anchor_id) {
		anchorMap[op.anchor_id] = id;
	}
}

function applyRemove(
	editor: Editor,
	op: Extract<RefineOp, { op: "remove" }>,
): void {
	const entry = findNodeById(editor, op.id);
	if (!entry) return;
	Transforms.removeNodes(editor, { at: entry[1] });
}

function applySet(
	editor: Editor,
	op: Extract<RefineOp, { op: "set" }>,
	connectors: ConnectorRegistry,
): void {
	const entry = findNodeById(editor, op.id);
	if (!entry) return;
	let [element, path] = entry;

	if (op.type && op.type !== element.type) {
		const replacement = createCanvasNode(op.type, connectors, {
			id: op.id,
			attrs: preservedAttributes(element, op.type),
		});
		Transforms.setNodes(
			editor,
			{ type: op.type, customAttributes: replacement.customAttributes },
			{ at: path },
		);
		// Re-fetch the updated element for subsequent attr/text changes
		const updated = findNodeById(editor, op.id);
		if (!updated) return;
		[element, path] = updated;
	}

	if (op.attrs) {
		setNodeAttrs(editor, path, element, op.attrs);
	}

	if (op.text !== undefined) {
		updateNodeText(editor, path, op.text);
	}
}
