import isNil from "lodash/isNil";
import omitBy from "lodash/omitBy";
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
	NARRATOR,
	REFERENCE_URLS_ATTR,
	referenceUrls,
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
import {
	PLAYGROUND_CONTENT_TYPES,
	playgroundTypeOf,
	type AssetElement,
	type AssetType,
	type PlaygroundType,
} from "./types";

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
				attrs: omitBy({ name, ...attrs }, isNil) as Record<string, string>,
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

const insertDraft = (editor: Editor, draft: AssetElement) =>
	Transforms.insertNodes(editor, draft, { at: [0] });

const newDraft = (editor: Editor, type: PlaygroundType): AssetElement =>
	createCanvasElement(type, { defaultModels: editor.defaultModels() });

/** Gives every playground type its draft; run where the undo stack starts empty, since each insert shifts every path on it. */
export function seedDrafts(editor: Editor): void {
	for (const type of PLAYGROUND_CONTENT_TYPES.map(playgroundTypeOf))
		if (!findAsset(editor.children, type))
			insertDraft(editor, newDraft(editor, type));
}

/** The draft's id, remade outside undo if something removed it, clearing the stack its insert would shift. */
export function ensureDraft(editor: Editor, type: PlaygroundType): string {
	const found = findAsset(editor.children, type);
	if (found) return found.id;
	const draft = newDraft(editor, type);
	HistoryEditor.withoutSaving(editor, () => insertDraft(editor, draft));
	editor.history = { undos: [], redos: [] };
	return draft.id;
}

/** Puts a playground draft back on the prompt and attributes one of its takes came from. */
export function restoreDraft(
	editor: Editor,
	type: PlaygroundType,
	version: Pick<ElementVersion, "inputs">,
): void {
	const id = ensureDraft(editor, type);
	HistoryEditor.withoutSaving(editor, () =>
		applyElementVersion(editor, id, version),
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

/** A new character speaks, and is drawn unless they are the narrator. */
export function addCharacter(editor: Editor, name: string): void {
	ensureAsset(editor, "asset_voice", name);
	if (name !== NARRATOR) ensureAsset(editor, "asset_avatar", name);
}

/** Removes a character's look and voice, returning what puts them back. */
export function removeCharacter(editor: Editor, name: string): () => void {
	const theirs = (node: unknown) =>
		isAsset(node, "asset_avatar", name) || isAsset(node, "asset_voice", name);
	const removed = editor.children.filter(theirs);
	Transforms.removeNodes(editor, { at: [], match: theirs });
	return () => Transforms.insertNodes(editor, removed, { at: [0] });
}
