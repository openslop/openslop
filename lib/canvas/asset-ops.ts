import isNil from "lodash/isNil";
import omitBy from "lodash/omitBy";
import uniq from "lodash/uniq";
import { Editor, Transforms } from "slate";
import { serializeReferenceImages } from "@/lib/connectors/attributes/reference-images";
import type { TTSLanguage } from "@/lib/connectors/tts/enums";
import { findAsset, isAsset, NARRATOR, REFERENCE_URLS_ATTR } from "./assets";
import { createCanvasElement } from "./create-canvas-element";
import {
	mergeAttrs,
	updateElementText,
	type AttributeChanges,
} from "./editor-ops";
import { isAssetElement } from "./guards";
import type { AssetType } from "./types";

type AssetPatch = { attrs?: AttributeChanges; text?: string };

const creationDefaults = (
	editor: Editor,
	type: AssetType,
): { language?: TTSLanguage } =>
	type === "asset_voice" ? { language: editor.defaultLanguage() } : {};

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
				attrs: omitBy(
					{ name, ...creationDefaults(editor, type), ...attrs },
					isNil,
				) as Record<string, string>,
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
