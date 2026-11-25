"use client";

import type { Editor } from "slate";
import { useSlateSelector } from "slate-react";
import { shallow } from "zustand/shallow";
import {
	findAsset,
	findImageAsset,
	getAssets,
	kindOfName,
	namedAssetNames,
	namesOfKind,
	type AssetKind,
	type ImageAssetType,
} from "./assets";
import type { AssetElement, AssetType } from "./types";

const selectAssets = (editor: Editor) => getAssets(editor.children);

export const useAssets = (): AssetElement[] =>
	useSlateSelector(selectAssets, shallow);

export const useNamesOfKind = (kind: AssetKind): string[] =>
	useSlateSelector((editor) => namesOfKind(editor.children, kind), shallow);

export const useNamedAssetNames = (): string[] =>
	useSlateSelector((editor) => namedAssetNames(editor.children), shallow);

export const useImageAssetType = (name: string): ImageAssetType | undefined =>
	useSlateSelector((editor) => findImageAsset(editor.children, name)?.type);

export const useKindOfName = (name: string): AssetKind | undefined =>
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
