import { Editor, Path, Transforms } from "slate";
import {
	findNodeById,
	mergeAttrs,
	updateNodeText,
} from "@/lib/canvas/editorOps";
import { insertElement } from "@/lib/canvas/insertElement";
import { createCanvasNode } from "@/lib/canvas/createCanvasNode";
import { preservedAttributes } from "@/lib/canvas/preservedAttributes";
import type { ConnectorModels } from "@/lib/connectors/models";
import type { RefineOp } from "./types";

export type RefineOpResult = { ok: true } | { ok: false; reason: string };

const OK: RefineOpResult = { ok: true };

export function applyRefineOp(
	editor: Editor,
	op: RefineOp,
	anchorMap: Record<string, string>,
	defaultModels?: ConnectorModels,
): RefineOpResult {
	let result: RefineOpResult = OK;
	Editor.withoutNormalizing(editor, () => {
		switch (op.op) {
			case "insert":
				result = applyInsert(editor, op, anchorMap, defaultModels);
				break;
			case "remove":
				result = applyRemove(editor, op);
				break;
			case "set":
				result = applySet(editor, op, defaultModels);
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
	defaultModels?: ConnectorModels,
): { applied: number; failures: string[] } {
	const anchorMap: Record<string, string> = {};
	const failures: string[] = [];
	let applied = 0;

	for (const op of ops) {
		const result = applyRefineOp(editor, op, anchorMap, defaultModels);
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
	defaultModels?: ConnectorModels,
): RefineOpResult {
	const at = resolveInsertPath(editor, op, anchorMap);
	if (!at) {
		return {
			ok: false,
			reason: `insert: anchor "${op.anchor_id}" no longer exists`,
		};
	}

	const id = insertElement(editor, op.type, at, {
		attrs: op.attrs,
		text: op.text,
		defaultModels,
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
	defaultModels?: ConnectorModels,
): NodeEntry | null {
	const [element, path] = entry;
	const replacement = createCanvasNode(type, {
		id,
		attrs: preservedAttributes(element, type),
		defaultModels,
	});
	Transforms.setNodes(
		editor,
		{
			type,
			generationAttributes: replacement.generationAttributes,
			layoutAttributes: replacement.layoutAttributes,
		},
		{ at: path },
	);
	return findNodeById(editor, id);
}

function applySet(
	editor: Editor,
	op: Extract<RefineOp, { op: "set" }>,
	defaultModels?: ConnectorModels,
): RefineOpResult {
	const entry = findNodeById(editor, op.id);
	if (!entry) return { ok: false, reason: `set: no element "${op.id}"` };

	const target =
		op.type && op.type !== entry[0].type
			? replaceNodeType(editor, op.id, entry, op.type, defaultModels)
			: entry;
	if (!target)
		return { ok: false, reason: `set: could not retype element "${op.id}"` };
	const [element, path] = target;

	if (op.attrs) {
		mergeAttrs(editor, path, element, op.attrs);
	}

	if (op.text !== undefined) {
		updateNodeText(editor, path, op.text);
	}
	return OK;
}
