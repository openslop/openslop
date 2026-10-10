import { Editor, Path, Transforms } from "slate";
import { setAsset } from "@/lib/canvas/asset-ops";
import {
	findElementById,
	mergeAttrs,
	retypeElement,
	updateElementText,
} from "@/lib/canvas/editor-ops";
import {
	isAssetElement,
	isAssetType,
	isContentElement,
} from "@/lib/canvas/guards";
import { insertElement } from "@/lib/canvas/insert-element";
import { isScene } from "@/lib/canvas/scenes";
import type { RefineOp } from "./types";

export type RefineOpResult = { ok: true } | { ok: false; reason: string };

const OK: RefineOpResult = { ok: true };

export function applyRefineOp(
	editor: Editor,
	op: RefineOp,
	anchorMap: Record<string, string>,
): RefineOpResult {
	let result: RefineOpResult = OK;
	Editor.withoutNormalizing(editor, () => {
		switch (op.op) {
			case "insert":
				result = applyInsert(editor, op, anchorMap);
				break;
			case "remove":
				result = applyRemove(editor, op);
				break;
			case "set":
				result = applySet(editor, op);
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
): { applied: number; failures: string[] } {
	const anchorMap: Record<string, string> = {};
	const results = ops.map((op) => applyRefineOp(editor, op, anchorMap));
	return {
		applied: results.filter((result) => result.ok).length,
		failures: results.flatMap((result) => (result.ok ? [] : [result.reason])),
	};
}

function resolveInsertPath(
	editor: Editor,
	op: Extract<RefineOp, { op: "insert" }>,
	anchorMap: Record<string, string>,
): Path | null {
	if (!op.anchor_id) {
		const firstScene = editor.children.findIndex(isScene);
		return op.position === "before" && firstScene >= 0
			? [firstScene, 0]
			: [editor.children.length];
	}

	const resolvedId = anchorMap[op.anchor_id] ?? op.anchor_id;
	const entry =
		findElementById(editor, resolvedId) ??
		findElementById(editor, op.anchor_id);
	if (!entry || !isContentElement(entry[0])) return null;

	return op.position === "before" ? entry[1] : Path.next(entry[1]);
}

function applyInsert(
	editor: Editor,
	op: Extract<RefineOp, { op: "insert" }>,
	anchorMap: Record<string, string>,
): RefineOpResult {
	if (isAssetType(op.type)) {
		setAsset(editor, op.type, op.attrs?.name, {
			attrs: op.attrs,
			text: op.text || undefined,
		});
		return OK;
	}

	const at = resolveInsertPath(editor, op, anchorMap);
	if (!at) {
		return {
			ok: false,
			reason: `insert: no element "${op.anchor_id}" to anchor on`,
		};
	}

	const id = insertElement(editor, op.type, at, {
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
	const entry = findElementById(editor, op.id);
	if (!entry) return { ok: false, reason: `remove: no element "${op.id}"` };
	Transforms.removeNodes(editor, { at: entry[1] });
	return OK;
}

function applySet(
	editor: Editor,
	op: Extract<RefineOp, { op: "set" }>,
): RefineOpResult {
	const entry = findElementById(editor, op.id);
	if (!entry) return { ok: false, reason: `set: no element "${op.id}"` };
	const [found, at] = entry;

	if (isAssetElement(found) && op.attrs && "name" in op.attrs)
		return {
			ok: false,
			reason: `set: an asset's name never changes; remove "${op.id}" and insert it again`,
		};

	if (op.type && op.type !== found.type) {
		if (!isContentElement(found))
			return { ok: false, reason: `set: asset "${op.id}" keeps its type` };
		retypeElement(editor, at, found, op.type);
	}
	if (op.attrs) {
		mergeAttrs(editor, op.id, op.attrs);
	}

	if (op.text !== undefined) {
		updateElementText(editor, op.id, op.text);
	}
	return OK;
}
