import isString from "lodash/isString";
import pickBy from "lodash/pickBy";
import uniq from "lodash/uniq";
import { Editor, Transforms } from "slate";
import { HistoryEditor } from "slate-history";
import {
	parseReferenceImages,
	serializeReferenceImages,
} from "@/lib/connectors/attributes/reference-images";
import {
	findAsset,
	isAsset,
	isNamedAsset,
	ASSET_KIND_SPECS,
	type AssetKind,
	REFERENCE_URLS_ATTR,
	referenceUrls,
	requireAsset,
} from "./assets";
import { createCanvasElement } from "./create-canvas-element";
import {
	applyElementVersion,
	mergeAttrs,
	requireElement,
	updateElementText,
	type AttributeChanges,
} from "./editor-ops";
import { isAssetElement } from "./guards";
import type { ElementVersion } from "@/lib/generation/versions";
import type { AssetType, MediaDraftType } from "./types";

type AssetPatch = { attrs?: AttributeChanges; text?: string };

export function setAsset(
	editor: Editor,
	type: AssetType,
	name: string | undefined,
	{ attrs = {}, text }: AssetPatch = {},
): void {
	const asset = findAsset(editor.children, type, name);
	if (!asset) {
		Transforms.insertNodes(
			editor,
			createCanvasElement(type, {
				attrs: pickBy({ name, ...attrs }, isString),
				text: text?.trim(),
				defaultModels: editor.defaultModels(),
			}),
			{ at: [0] },
		);
		return;
	}
	mergeAttrs(editor, asset.id, attrs);
	if (text !== undefined) updateElementText(editor, asset.id, text);
}

export function ensureAsset(
	editor: Editor,
	type: AssetType,
	name?: string,
): void {
	if (!findAsset(editor.children, type, name)) setAsset(editor, type, name);
}

export function setReferenceImages(editor: Editor, urls: string[]): void {
	setAsset(editor, "asset_references", undefined, {
		attrs: { [REFERENCE_URLS_ATTR]: serializeReferenceImages(uniq(urls)) },
	});
}

/** An element still on the project's references starts its own from them. */
export function addElementReferences(
	editor: Editor,
	id: string,
	attrKey: string,
	added: string[],
): void {
	const [element] = requireElement(editor, id);
	const current =
		parseReferenceImages(element.generationAttributes?.[attrKey]) ??
		referenceUrls(editor.children);
	mergeAttrs(editor, id, {
		[attrKey]: serializeReferenceImages(uniq([...current, ...added])),
	});
}

/** Puts a media draft back on the prompt and attributes one of its takes came from. */
export function restoreDraft(
	editor: Editor,
	type: MediaDraftType,
	version: Pick<ElementVersion, "inputs">,
): void {
	const draft = requireAsset(editor.children, type);
	HistoryEditor.withoutSaving(editor, () =>
		applyElementVersion(editor, draft.id, version),
	);
}

const EMPTY_INPUTS = {
	prompt: "",
	attributes: {},
	reads: {},
	dependencies: {},
};

/** Back to a blank prompt with no settings, as the draft first was. */
export function clearDraft(editor: Editor, id: string): void {
	HistoryEditor.withoutSaving(editor, () =>
		applyElementVersion(editor, id, { inputs: EMPTY_INPUTS }),
	);
}

export function removeAssets(editor: Editor): void {
	Transforms.removeNodes(editor, { at: [], match: isAssetElement });
}

export function removeAsset(
	editor: Editor,
	type: AssetType,
	name?: string,
): void {
	Transforms.removeNodes(editor, {
		at: [],
		match: (node) => isAsset(node, type, name),
	});
}

export function addNamedAsset(
	editor: Editor,
	kind: AssetKind,
	name: string,
): void {
	for (const type of ASSET_KIND_SPECS[kind].types)
		ensureAsset(editor, type, name);
}

/** Removes everything named `name`, returning what puts it back. */
export function removeNamedAsset(editor: Editor, name: string): () => void {
	const theirs = (node: unknown) => isNamedAsset(node, name);
	const removed = editor.children.filter(theirs);
	Transforms.removeNodes(editor, { at: [], match: theirs });
	return () => Transforms.insertNodes(editor, removed, { at: [0] });
}
