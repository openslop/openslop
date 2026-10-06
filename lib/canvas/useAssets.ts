"use client";

import type { Editor } from "slate";
import { useSlateSelector } from "slate-react";
import { shallow } from "zustand/shallow";
import {
	assetText,
	avatarNames,
	characterNames,
	findAsset,
	getAssets,
	getCharacters,
} from "./assets";
import type { AssetElement, AssetType } from "./types";

const selectAssets = (editor: Editor) => getAssets(editor.children);

/** The project's assets, re-read only when one of them changes. */
export const useAssets = (): AssetElement[] =>
	useSlateSelector(selectAssets, shallow);

const selectCharacters = (editor: Editor) => getCharacters(editor.children);

export const useCharacters = (): AssetElement<"asset_character">[] =>
	useSlateSelector(selectCharacters, shallow);

const selectCharacterNames = (editor: Editor) =>
	characterNames(editor.children);

export const useCharacterNames = (): string[] =>
	useSlateSelector(selectCharacterNames, shallow);

const selectAvatarNames = (editor: Editor) => avatarNames(editor.children);

export const useAvatarNames = (): string[] =>
	useSlateSelector(selectAvatarNames, shallow);

export const useAsset = <T extends AssetType>(
	type: T,
	name?: string,
): AssetElement<T> | undefined =>
	useSlateSelector((editor) => findAsset(editor.children, type, name));

const selectTitle = (editor: Editor) =>
	assetText(editor.children, "asset_title");

export const useProjectTitle = (): string => useSlateSelector(selectTitle);
