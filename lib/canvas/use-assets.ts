"use client";

import type { Editor } from "slate";
import { useSlateSelector } from "slate-react";
import { shallow } from "zustand/shallow";
import {
	allAssetNames,
	assetNames,
	findAsset,
	getAssets,
	kindOfName,
	type AssetKind,
} from "./assets";
import type { AssetElement, AssetType } from "./types";

const selectAssets = (editor: Editor) => getAssets(editor.children);

export const useAssets = (): AssetElement[] =>
	useSlateSelector(selectAssets, shallow);

export const useAssetNames = (kind: AssetKind): string[] =>
	useSlateSelector((editor) => assetNames(editor.children, kind), shallow);

export const useAllAssetNames = (): string[] =>
	useSlateSelector((editor) => allAssetNames(editor.children), shallow);

export const useKindOf = (name: string): AssetKind | undefined =>
	useSlateSelector((editor) => kindOfName(editor.children, name));

export const useAsset = <T extends AssetType>(
	type: T,
	name?: string,
): AssetElement<T> | undefined =>
	useSlateSelector((editor) => findAsset(editor.children, type, name));

export const useHasAsset = (type: AssetType, name?: string): boolean =>
	useSlateSelector(
		(editor) => findAsset(editor.children, type, name) !== undefined,
	);
