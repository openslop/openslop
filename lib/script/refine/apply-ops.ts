import isEmpty from "lodash/isEmpty";
import { Editor, Path, Transforms } from "slate";
import { setAsset } from "@/lib/canvas/asset-ops";
import { flatAttributes } from "@/lib/canvas/element-attributes";
import { attributeSchemaFor } from "@/lib/canvas/element-connector";
import {
	findElementById,
	mergeAttrs,
	updateElementText,
} from "@/lib/canvas/editor-ops";
import { isAssetElement, isContentElement } from "@/lib/canvas/guards";
import { insertElement } from "@/lib/canvas/insert-element";
import { isScene } from "@/lib/canvas/scenes";
import type { AssetType, ElementType } from "@/lib/canvas/types";
import { fromKeys } from "@/lib/utils";
import type { NewElement, RefineOp } from "./types";

export type RefineOpResult =
	| { ok: true; inserted: string[] }
	| { ok: false; reason: string };

export type RefineReport = {
	applied: number;
	failures: string[];
	inserted: string[];
};

const OK: RefineOpResult = { ok: true, inserted: [] };

const CHARACTER_ASSETS = new Set<AssetType>(["asset_avatar", "asset_voice"]);

/** Every one of `edits` the element's own schema would never produce, or nothing. */
function unofferedAttributes(
	type: ElementType,
	edits: Record<string, string>,
	current: Record<string, string> = {},
): string | undefined {
	const schema = attributeSchemaFor(type, { ...current, ...edits });
	const misses = Object.entries(edits)
		.filter(([key, value]) => !schema.offers(key, value))
		.map(([key, value]) => `${key} "${value}"`);
	return misses.length > 0
		? `${type} offers no ${misses.join(", ")}`
		: undefined;
}

export function applyRefineOp(editor: Editor, op: RefineOp): RefineOpResult {
	let result: RefineOpResult = OK;
	Editor.withoutNormalizing(editor, () => {
		switch (op.op) {
			case "insert":
				result = applyInsert(editor, op);
				break;
			case "asset":
				result = applyAsset(editor, op);
				break;
			case "remove":
				result = applyRemove(editor, op);
				break;
			case "move":
				result = applyMove(editor, op);
				break;
			case "set":
				result = applySet(editor, op);
				break;
		}
	});
	return result;
}

/** Applies a turn's ops in order; a failed op is reported, never rolled back. */
export function applyRefineOps(editor: Editor, ops: RefineOp[]): RefineReport {
	const results = ops.map((op) => applyRefineOp(editor, op));
	return {
		applied: results.filter((result) => result.ok).length,
		failures: results.flatMap((result) => (result.ok ? [] : [result.reason])),
		inserted: results.flatMap((result) => (result.ok ? result.inserted : [])),
	};
}

function resolveInsertPath(
	editor: Editor,
	op: Pick<Extract<RefineOp, { op: "insert" }>, "anchor_id" | "position">,
): Path | null {
	if (!op.anchor_id) {
		const firstScene = editor.children.findIndex(isScene);
		return op.position === "before" && firstScene >= 0
			? [firstScene, 0]
			: [editor.children.length];
	}
	const entry = findElementById(editor, op.anchor_id);
	if (!entry || !isContentElement(entry[0])) return null;
	return op.position === "before" ? entry[1] : Path.next(entry[1]);
}

function elementProblems({ type, attrs, text }: NewElement): string[] {
	return [
		unofferedAttributes(type, attrs ?? {}),
		text?.trim() ? undefined : `${type} needs text`,
	].filter((problem) => problem !== undefined);
}

function applyInsert(
	editor: Editor,
	op: Extract<RefineOp, { op: "insert" }>,
): RefineOpResult {
	const problems = op.elements.flatMap(elementProblems);
	if (problems.length > 0)
		return { ok: false, reason: `insert: ${problems.join("; ")}` };

	const at = resolveInsertPath(editor, op);
	if (!at) {
		return {
			ok: false,
			reason: `insert: no element "${op.anchor_id}" to anchor on`,
		};
	}

	let path = at;
	const inserted: string[] = [];
	for (const { type, attrs, text } of op.elements) {
		inserted.push(insertElement(editor, type, path, { attrs, text }));
		path = Path.next(path);
	}
	return { ok: true, inserted };
}

function applyAsset(
	editor: Editor,
	{ element: { type, attrs, text } }: Extract<RefineOp, { op: "asset" }>,
): RefineOpResult {
	const problems = [
		unofferedAttributes(type, attrs ?? {}),
		CHARACTER_ASSETS.has(type) && !attrs?.name
			? `${type} needs a name`
			: undefined,
	].filter((problem) => problem !== undefined);
	if (problems.length > 0)
		return { ok: false, reason: `asset: ${problems.join("; ")}` };

	setAsset(editor, type, attrs?.name, { attrs, text: text || undefined });
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

function applyMove(
	editor: Editor,
	op: Extract<RefineOp, { op: "move" }>,
): RefineOpResult {
	const entry = findElementById(editor, op.id);
	if (!entry || !isContentElement(entry[0]))
		return { ok: false, reason: `move: no script element "${op.id}"` };

	const slot = resolveInsertPath(editor, op);
	if (!slot) {
		return {
			ok: false,
			reason: `move: no element "${op.anchor_id}" to anchor on`,
		};
	}

	const [node, at] = entry;
	// Slate reads a move's destination as counted without the moved node.
	const to =
		Path.transform(slot, { type: "remove_node", path: at, node }) ?? at;
	Transforms.moveNodes(editor, { at, to });
	return OK;
}

function applySet(
	editor: Editor,
	{ id, element, drop = [] }: Extract<RefineOp, { op: "set" }>,
): RefineOpResult {
	const entry = findElementById(editor, id);
	if (!entry) return { ok: false, reason: `set: no element "${id}"` };
	const [found] = entry;
	if (found.type !== element.type)
		return {
			ok: false,
			reason: `set: "${id}" is a ${found.type}, not a ${element.type}`,
		};
	const current = flatAttributes(found);
	const edits = { ...element.attrs, ...fromKeys(drop, () => null) };

	if (
		isAssetElement(found) &&
		edits.name !== undefined &&
		edits.name !== current.name
	)
		return {
			ok: false,
			reason: `set: an asset's name never changes; remove "${id}" and create it again with an asset op`,
		};

	const unoffered = unofferedAttributes(
		found.type,
		element.attrs ?? {},
		current,
	);
	if (unoffered) return { ok: false, reason: `set: ${unoffered}` };
	if (!isEmpty(edits)) mergeAttrs(editor, id, edits);
	if (element.text !== undefined) updateElementText(editor, id, element.text);
	return OK;
}
