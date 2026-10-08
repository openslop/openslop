import compact from "lodash/compact";
import isNil from "lodash/isNil";
import omitBy from "lodash/omitBy";
import uniq from "lodash/uniq";
import without from "lodash/without";
import xor from "lodash/xor";
import { Editor, Transforms } from "slate";
import { serializeReferenceImages } from "@/lib/connectors/attributes/referenceImages";
import { findAsset, NARRATOR, REFERENCE_URLS_ATTR } from "./assets";
import { createCanvasElement } from "./createCanvasElement";
import {
	CHARACTERS_ATTR,
	formatCharacterNames,
	shownCharacters,
} from "./characterNames";
import {
	mergeAttrs,
	updateElementText,
	type AttributeChanges,
} from "./editorOps";
import { isAssetElement } from "./guards";
import {
	assetId,
	type AssetElement,
	type AssetType,
	type CanvasElement,
} from "./types";

type AssetPatch = { attrs?: AttributeChanges; text?: string };

/** Writes the asset `type` holds under `name`, adding it when there is none. */
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
				text,
				defaultModels: editor.defaultModels(),
			}),
			{ at: [0] },
		);
		return;
	}
	mergeAttrs(editor, asset.id, attrs);
	if (text !== undefined) updateElementText(editor, asset.id, text);
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
	element: CanvasElement,
	edit: (names: string[]) => string[],
): void =>
	mergeAttrs(editor, element.id, {
		[CHARACTERS_ATTR]: formatCharacterNames(edit(shownCharacters(element))),
	});

export const toggleShownCharacter = (
	editor: Editor,
	element: CanvasElement,
	name: string,
): void => editShown(editor, element, (names) => xor(names, [name]));

export const removeShownCharacter = (
	editor: Editor,
	element: CanvasElement,
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

/** A new character speaks, and is drawn unless they are the narrator. */
export function addCharacter(editor: Editor, name: string): void {
	ensureAsset(editor, "asset_voice", name);
	if (name !== NARRATOR) ensureAsset(editor, "asset_avatar", name);
}

/** A character's look and voice, handed back so they can be restored. */
export function removeCharacter(editor: Editor, name: string): AssetElement[] {
	const removed = compact([
		findAsset(editor.children, "asset_avatar", name),
		findAsset(editor.children, "asset_voice", name),
	]);
	removeAsset(editor, "asset_avatar", name);
	removeAsset(editor, "asset_voice", name);
	return removed;
}

/** Puts removed assets back; a copy already on the canvas gives way to them. */
export function restoreAssets(editor: Editor, assets: AssetElement[]): void {
	Transforms.insertNodes(editor, assets, { at: [0] });
}
