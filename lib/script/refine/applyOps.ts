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

// Chains consecutive no-anchor prepends so they land in stream order.
const PREPEND_ANCHOR = "";

// "after" inserts chain the anchorMap to the last inserted id. "before"
// inserts stack naturally by targeting the anchor's current path, so
// chaining them would reverse stream order.
function resolveInsertPath(
	editor: Editor,
	op: Extract<RefineOp, { op: "insert" }>,
	anchorMap: Record<string, string>,
): Path {
	if (op.position === "before") {
		if (op.anchor_id) {
			const entry = findNodeById(editor, op.anchor_id);
			return entry ? entry[1] : [editor.children.length];
		}
		const lastPrepended = anchorMap[PREPEND_ANCHOR];
		const entry = lastPrepended ? findNodeById(editor, lastPrepended) : null;
		return entry ? Path.next(entry[1]) : [0, 0];
	}

	if (!op.anchor_id) return [editor.children.length];

	const resolvedId = anchorMap[op.anchor_id] ?? op.anchor_id;
	const entry =
		findNodeById(editor, resolvedId) ?? findNodeById(editor, op.anchor_id);
	if (!entry) return [editor.children.length];

	return Path.next(entry[1]);
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

	if (op.position === "before") {
		if (!op.anchor_id) anchorMap[PREPEND_ANCHOR] = id;
	} else if (op.anchor_id) {
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

type NodeEntry = NonNullable<ReturnType<typeof findNodeById>>;
type SetType = NonNullable<Extract<RefineOp, { op: "set" }>["type"]>;

function replaceNodeType(
	editor: Editor,
	id: string,
	entry: NodeEntry,
	type: SetType,
	connectors: ConnectorRegistry,
): NodeEntry | null {
	const [element, path] = entry;
	const replacement = createCanvasNode(type, connectors, {
		id,
		attrs: preservedAttributes(element, type),
	});
	Transforms.setNodes(
		editor,
		{ type, customAttributes: replacement.customAttributes },
		{ at: path },
	);
	return findNodeById(editor, id);
}

function applySet(
	editor: Editor,
	op: Extract<RefineOp, { op: "set" }>,
	connectors: ConnectorRegistry,
): void {
	const entry = findNodeById(editor, op.id);
	if (!entry) return;

	const target =
		op.type && op.type !== entry[0].type
			? replaceNodeType(editor, op.id, entry, op.type, connectors)
			: entry;
	if (!target) return;
	const [element, path] = target;

	if (op.attrs) {
		setNodeAttrs(editor, path, element, op.attrs);
	}

	if (op.text !== undefined) {
		updateNodeText(editor, path, op.text);
	}
}
