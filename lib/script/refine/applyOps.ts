import { Editor, Path, Transforms } from "slate";
import {
	findNodeById,
	setNodeAttrs,
	updateNodeText,
} from "@/lib/canvas/editorOps";
import { insertElement } from "@/lib/canvas/insertElement";
import { createCanvasNode } from "@/lib/canvas/createCanvasNode";
import { preservedAttributes } from "@/lib/canvas/preservedAttributes";
import type { ConnectorRegistry } from "@/lib/connectors/registry";
import type { RefineOp } from "./types";

/**
 * Whether an op landed. A missing anchor is reported rather than silently
 * resolved to some other position: under an agent, quietly appending an element
 * the caller asked to place elsewhere is a confident wrong edit with no signal.
 */
export type RefineOpResult = { ok: true } | { ok: false; reason: string };

const OK: RefineOpResult = { ok: true };

export function applyRefineOp(
	editor: Editor,
	op: RefineOp,
	anchorMap: Record<string, string>,
	connectors: ConnectorRegistry,
): RefineOpResult {
	let result: RefineOpResult = OK;
	Editor.withoutNormalizing(editor, () => {
		switch (op.op) {
			case "insert":
				result = applyInsert(editor, op, anchorMap, connectors);
				break;
			case "remove":
				result = applyRemove(editor, op);
				break;
			case "set":
				result = applySet(editor, op, connectors);
				break;
		}
	});
	return result;
}

/**
 * Applies a turn's ops in order. Ops are not rolled back on failure: a later op
 * may legitimately depend on an element an earlier one created, so each op is
 * judged on its own and every failure is reported back to the caller.
 */
export function applyRefineOps(
	editor: Editor,
	ops: RefineOp[],
	connectors: ConnectorRegistry,
): { applied: number; failures: string[] } {
	const anchorMap: Record<string, string> = {};
	const failures: string[] = [];
	let applied = 0;

	for (const op of ops) {
		const result = applyRefineOp(editor, op, anchorMap, connectors);
		if (result.ok) applied += 1;
		else failures.push(result.reason);
	}

	return { applied, failures };
}

function resolveInsertPath(
	editor: Editor,
	op: Extract<RefineOp, { op: "insert" }>,
	anchorMap: Record<string, string>,
): Path | null {
	if (!op.anchor_id) {
		return op.position === "before" ? [0, 0] : [editor.children.length];
	}

	const resolvedId = anchorMap[op.anchor_id] ?? op.anchor_id;
	const entry =
		findNodeById(editor, resolvedId) ?? findNodeById(editor, op.anchor_id);
	if (!entry) return null;

	return op.position === "before" ? entry[1] : Path.next(entry[1]);
}

function applyInsert(
	editor: Editor,
	op: Extract<RefineOp, { op: "insert" }>,
	anchorMap: Record<string, string>,
	connectors: ConnectorRegistry,
): RefineOpResult {
	const at = resolveInsertPath(editor, op, anchorMap);
	if (!at) {
		return {
			ok: false,
			reason: `insert: anchor "${op.anchor_id}" no longer exists`,
		};
	}

	const id = insertElement(editor, op.type, at, connectors, {
		attrs: op.attrs,
		text: op.text,
	});

	if (op.anchor_id) {
		anchorMap[op.anchor_id] = id;
	}
	return OK;
}

function applyRemove(
	editor: Editor,
	op: Extract<RefineOp, { op: "remove" }>,
): RefineOpResult {
	const entry = findNodeById(editor, op.id);
	if (!entry) return { ok: false, reason: `remove: no element "${op.id}"` };
	Transforms.removeNodes(editor, { at: entry[1] });
	return OK;
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
): RefineOpResult {
	const entry = findNodeById(editor, op.id);
	if (!entry) return { ok: false, reason: `set: no element "${op.id}"` };

	const target =
		op.type && op.type !== entry[0].type
			? replaceNodeType(editor, op.id, entry, op.type, connectors)
			: entry;
	if (!target)
		return { ok: false, reason: `set: could not retype element "${op.id}"` };
	const [element, path] = target;

	if (op.attrs) {
		setNodeAttrs(editor, path, element, op.attrs);
	}

	if (op.text !== undefined) {
		updateNodeText(editor, path, op.text);
	}
	return OK;
}
