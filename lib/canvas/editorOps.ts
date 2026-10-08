import isNil from "lodash/isNil";
import mapValues from "lodash/mapValues";
import omitBy from "lodash/omitBy";
import { Editor, Element, type NodeEntry, Path, Transforms } from "slate";
import type {
	ContentElement,
	CanvasBlock,
	CanvasElement,
} from "@/lib/canvas/types";
import { reconcileAttributes } from "@/lib/connectors/attributes/reconcile";
import type { ElementVersion } from "@/lib/generation/versions";
import {
	flatAttributes,
	splitAttributes,
} from "@/lib/canvas/elementAttributes";
import { withoutCaretMarker, ZERO_WIDTH_SPACE } from "./constants";
import { createCanvasElement } from "./createCanvasElement";
import { attributeSchemaFor } from "./elementConnector";
import { isCanvasElement } from "./guards";
import { makeNodeId } from "./nodeUtils";
import { preservedAttributes } from "./preservedAttributes";

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
	const [, path] = requireElement(editor, id);
	const voids = true;
	const currentText = Editor.string(editor, path, { voids });
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

/**
 * Makes an element another type in place, keeping its id and text.
 */
export function retypeElement(
	editor: Editor,
	path: Path,
	element: ContentElement,
	type: ContentElement["type"],
): void {
	const replacement = createCanvasElement(type, {
		id: element.id,
		attrs: preservedAttributes(element, type),
		defaultModels: editor.defaultModels(),
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

/**
 * Puts an element back into the state that produced a version: the type it was
 * generated as, and the prompt and attributes it was generated from. Restoring
 * the inputs alone would leave an element of one type holding another type's
 * attributes.
 */
export function applyElementVersion(
	editor: Editor,
	id: string,
	{ elementType, inputs }: Pick<ElementVersion, "elementType" | "inputs">,
): void {
	const [, path] = requireElement(editor, id);
	if (elementType)
		Transforms.setNodes(editor, { type: elementType }, { at: path });
	replaceGenerationAttrs(editor, path, inputs.attributes);
	updateElementText(editor, id, inputs.prompt);
}

/** A nil value deletes its key. */
export type AttributeChanges = Record<string, string | null | undefined>;

const withAttrs = (
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
