"use client";

import type { Editor } from "slate";
import { useSlateSelector } from "slate-react";
import { shallow } from "zustand/shallow";
import { useMemo } from "react";
import {
	assetText,
	castNames,
	findAsset,
	getAssets,
	projectModels,
	projectSettings,
} from "./assets";
import type { AssetElement, AssetType } from "./types";

const selectAssets = (editor: Editor) => getAssets(editor.children);

/** The project's assets, re-read only when one of them changes. */
export const useAssets = (): AssetElement[] =>
	useSlateSelector(selectAssets, shallow);

const selectCastNames = (editor: Editor) => castNames(editor.children);

export const useCastNames = (): string[] =>
	useSlateSelector(selectCastNames, shallow);

export const useAsset = <T extends AssetType>(
	type: T,
	name?: string,
): AssetElement<T> | undefined =>
	useSlateSelector((editor) => findAsset(editor.children, type, name));

const selectTitle = (editor: Editor) => assetText(editor.children, "title");

export const useProjectTitle = (): string => useSlateSelector(selectTitle);

/** The project's script settings, re-parsed only when its `project` element changes. */
export function useProjectSettings() {
	const element = useAsset("project");
	return useMemo(() => projectSettings(element ? [element] : []), [element]);
}

export function useProjectModels() {
	const element = useAsset("project");
	return useMemo(() => projectModels(element ? [element] : []), [element]);
}
