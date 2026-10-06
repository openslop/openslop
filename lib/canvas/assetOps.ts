import isNil from "lodash/isNil";
import omitBy from "lodash/omitBy";
import uniq from "lodash/uniq";
import without from "lodash/without";
import xor from "lodash/xor";
import { Editor, Transforms } from "slate";
import { serializeReferenceImages } from "@/lib/connectors/attributes/referenceImages";
import { assetDefaults, findAsset, REFERENCE_URLS_ATTR } from "./assets";
import { createCanvasNode } from "./createCanvasNode";
import {
	CHARACTERS_ATTR,
	formatCharacterNames,
	shownCharacters,
} from "./characterNames";
import { mergeAttrs, updateNodeText, type AttributeChanges } from "./editorOps";
import { isAssetElement } from "./guards";
import {
	ASSET_TYPES,
	assetId,
	type AssetElement,
	type AssetType,
	type ScriptElement,
} from "./types";

const ASSET_ORDER = Object.keys(ASSET_TYPES);

const rank = (node: unknown) =>
	isAssetElement(node) ? ASSET_ORDER.indexOf(node.type) : ASSET_ORDER.length;

/** Adds an asset after the others of its type, in the order `ASSET_TYPES` lists them. */
export function insertAsset(editor: Editor, asset: AssetElement): void {
	const next = editor.children.findIndex((node) => rank(node) > rank(asset));
	Transforms.insertNodes(editor, asset, {
		at: [next < 0 ? editor.children.length : next],
	});
}

export type AssetPatch = { attrs?: AttributeChanges; text?: string };

/** Writes the asset `type` holds under `name`, adding it when there is none. */
export function setAsset(
	editor: Editor,
	type: AssetType,
	name: string | undefined,
	{ attrs = {}, text }: AssetPatch = {},
): void {
	const asset = findAsset(editor.children, type, name);
	if (!asset) {
		insertAsset(
			editor,
			createCanvasNode(type, {
				attrs: omitBy(
					{ name, ...assetDefaults(type, name), ...attrs },
					isNil,
				) as Record<string, string>,
				text,
				defaultModels: editor.defaultModels(),
			}),
		);
		return;
	}
	mergeAttrs(editor, asset.id, attrs);
	if (text !== undefined) updateNodeText(editor, asset.id, text);
}

/** The asset, added when there is none. */
export function ensureAsset(
	editor: Editor,
	type: AssetType,
	name?: string,
): void {
	if (!findAsset(editor.children, type, name)) setAsset(editor, type, name);
}

/** The project's reference images; none leaves no references element behind. */
export function setReferenceImages(editor: Editor, urls: string[]): void {
	if (urls.length === 0) return removeAsset(editor, "asset_references");
	setAsset(editor, "asset_references", undefined, {
		attrs: { [REFERENCE_URLS_ATTR]: serializeReferenceImages(uniq(urls)) },
	});
}

export function removeAssets(editor: Editor): void {
	Transforms.removeNodes(editor, { at: [], match: isAssetElement });
}

const editShown = (
	editor: Editor,
	element: ScriptElement,
	edit: (names: string[]) => string[],
): void =>
	mergeAttrs(editor, element.id, {
		[CHARACTERS_ATTR]: formatCharacterNames(edit(shownCharacters(element))),
	});

export const toggleShownCharacter = (
	editor: Editor,
	element: ScriptElement,
	name: string,
): void => editShown(editor, element, (names) => xor(names, [name]));

export const removeShownCharacter = (
	editor: Editor,
	element: ScriptElement,
	name: string,
): void => editShown(editor, element, (names) => without(names, name));

export function removeAsset(
	editor: Editor,
	type: AssetType,
	name?: string,
): void {
	const id = assetId(type, name);
	Transforms.removeNodes(editor, {
		at: [],
		match: (node) => isAssetElement(node) && node.id === id,
	});
}
