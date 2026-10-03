import isNil from "lodash/isNil";
import mapValues from "lodash/mapValues";
import omitBy from "lodash/omitBy";
import uniq from "lodash/uniq";
import without from "lodash/without";
import xor from "lodash/xor";
import { Editor, Transforms } from "slate";
import { serializeReferenceImages } from "@/lib/connectors/attributes/referenceImages";
import type { ConnectorModels } from "@/lib/connectors/models";
import { findAsset, formatModel, REFERENCE_URLS_ATTR } from "./assets";
import { createCanvasNode } from "./createCanvasNode";
import {
	CHARACTERS_ATTR,
	formatCharacterNames,
	shownCharacters,
} from "./characterNames";
import { mergeAttrs, updateNodeText, type AttributeChanges } from "./editorOps";
import { isAssetElement } from "./guards";
import { isSceneElement } from "./scenes";
import {
	assetId,
	type AssetElement,
	type AssetType,
	type ScriptElement,
} from "./types";

/** Adds an asset after the others, ahead of the first scene. */
export function insertAsset(editor: Editor, asset: AssetElement): void {
	const firstScene = editor.children.findIndex(isSceneElement);
	Transforms.insertNodes(editor, asset, {
		at: [firstScene < 0 ? editor.children.length : firstScene],
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
				attrs: omitBy({ name, ...attrs }, isNil) as Record<string, string>,
				text,
				defaultModels: editor.defaultModels(),
			}),
		);
		return;
	}
	mergeAttrs(editor, asset.id, attrs);
	if (text !== undefined) updateNodeText(editor, asset.id, text);
}

export function setReferenceImages(editor: Editor, urls: string[]): void {
	setAsset(editor, "references", undefined, {
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

export const setProjectSettings = (
	editor: Editor,
	attrs: AttributeChanges,
): void => setAsset(editor, "project", undefined, { attrs });

export const setProjectModels = (
	editor: Editor,
	models: ConnectorModels,
): void => setProjectSettings(editor, mapValues(models, formatModel));
