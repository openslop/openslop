import isNil from "lodash/isNil";
import mapValues from "lodash/mapValues";
import omit from "lodash/omit";
import omitBy from "lodash/omitBy";
import { Editor, Element, type NodeEntry, Path, Transforms } from "slate";
import type { CanvasBlock, CanvasElement } from "./types";
import { reconcileAttributes } from "@/lib/connectors/attributes/reconcile";
import type { ElementVersion } from "@/lib/generation/versions";
import { flatAttributes, splitAttributes } from "./element-attributes";
import { withoutCaretMarker, ZERO_WIDTH_SPACE } from "./constants";
import { attributeSchemaFor } from "./element-connector";
import { isCanvasElement } from "./guards";
import { getElementText } from "./osml-serializer";
import { makeNodeId } from "./node-utils";

/** Any block by id, a scene or an element. Use {@link findElementById} when a scene will not do. */
export function findBlockById(
	editor: Editor,
	id: string,
): NodeEntry<CanvasBlock> | null {
	const [entry] = Editor.nodes<CanvasBlock>(editor, {
		at: [],
		match: (n) => Element.isElement(n) && n.id === id,
	});
	return entry ?? null;
}

export function removeBlock(editor: Editor, id: string): void {
	const found = findBlockById(editor, id);
	if (!found) throw new Error(`Block "${id}" is not on the canvas`);
	Transforms.removeNodes(editor, { at: found[1] });
}

export function findElementById(
	editor: Editor,
	id: string,
): NodeEntry<CanvasElement> | null {
	const [entry] = Editor.nodes<CanvasElement>(editor, {
		at: [],
		match: (n) => isCanvasElement(n) && n.id === id,
	});
	return entry ?? null;
}

function requireElement(editor: Editor, id: string): NodeEntry<CanvasElement> {
	const found = findElementById(editor, id);
	if (!found) throw new Error(`Element "${id}" is not on the canvas`);
	return found;
}

export function duplicateElement(editor: Editor, id: string): void {
	const [element, path] = requireElement(editor, id);
	Transforms.insertNodes(
		editor,
		{
			...element,
			id: makeNodeId(),
			children: element.children.map((child) => ({
				...child,
				id: makeNodeId(),
			})),
		},
		{ at: Path.next(path) },
	);
}

/**
 * Takes body text: the deletion-guard marker is owned here, not by callers. The
 * full-range replace below spans the marker leaf, so writing raw text would drop
 * the guard and leave a cleared element looking non-empty.
 */
export function updateElementText(
	editor: Editor,
	id: string,
	newText: string,
): void {
	const [element, path] = requireElement(editor, id);
	const voids = true;
	const currentText = getElementText(element);
	const nextText = ZERO_WIDTH_SPACE + withoutCaretMarker(newText);
	if (currentText === nextText) return;

	if (nextText.startsWith(currentText)) {
		Transforms.insertText(editor, nextText.slice(currentText.length), {
			at: Editor.end(editor, path),
			voids,
		});
		return;
	}
	Transforms.insertText(editor, nextText, {
		at: Editor.range(editor, path),
		voids,
	});
}

export function replaceGenerationAttrs(
	editor: Editor,
	path: Path,
	attributes: Record<string, string | number>,
): void {
	Transforms.setNodes(
		editor,
		{ generationAttributes: mapValues(attributes, String) },
		{ at: path },
	);
}

/** Puts an element back on the prompt and attributes a version was generated from. */
export function applyElementVersion(
	editor: Editor,
	id: string,
	{ inputs }: Pick<ElementVersion, "inputs">,
): void {
	const [, path] = requireElement(editor, id);
	replaceGenerationAttrs(editor, path, inputs.attributes);
	updateElementText(editor, id, inputs.prompt);
}

/** A nil value deletes its key. */
export type AttributeChanges = Record<string, string | null | undefined>;

export const withAttrs = (
	attributes: Record<string, string>,
	changes: AttributeChanges,
): Record<string, string> =>
	omitBy({ ...attributes, ...changes }, isNil) as Record<string, string>;

/** Reconciled against the schema the merged attributes name, so a new model drops the old one's attributes. */
export function mergeAttrs(
	editor: Editor,
	id: string,
	attrs: AttributeChanges,
): void {
	const [element, path] = requireElement(editor, id);
	const current = flatAttributes(element);
	const merged = withAttrs(current, attrs);
	const reconciled = withAttrs(
		merged,
		reconcileAttributes(
			attributeSchemaFor(element.type, current),
			attributeSchemaFor(element.type, merged),
			merged,
		),
	);
	Transforms.setNodes(editor, splitAttributes(reconciled), { at: path });
}

const TRIM_KEYS = ["trimStart", "trimDuration"];

/** An element no longer on the canvas has no trim to reset. Dropping just `trimDuration` runs the clip out to its media's end. */
export function resetTrim(editor: Editor, id: string, keys = TRIM_KEYS): void {
	const found = findElementById(editor, id);
	if (!found) return;
	const [element, path] = found;
	const layout = element.layoutAttributes ?? {};
	if (!keys.some((key) => key in layout)) return;
	Transforms.setNodes(
		editor,
		{ layoutAttributes: omit(layout, keys) },
		{ at: path },
	);
}
