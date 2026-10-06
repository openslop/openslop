"use client";

import type { ReactNode } from "react";
import { useFocused, useSelected, type RenderElementProps } from "slate-react";
import type { AssetElement, AssetType } from "@/lib/canvas/types";
import {
	CharacterAssetTile,
	ReferenceAssetTiles,
	ArtStyleAssetTile,
} from "./AssetTiles";

const TILES: Record<
	AssetType,
	(props: { element: AssetElement; selected: boolean }) => ReactNode
> = {
	asset_style: ({ selected }) => <ArtStyleAssetTile selected={selected} />,
	asset_character: ({ element, selected }) => (
		<CharacterAssetTile character={element} selected={selected} />
	),
	asset_references: ({ selected }) => (
		<ReferenceAssetTiles selected={selected} />
	),
};

export function AssetBlock({
	attributes,
	children,
	element,
}: Omit<RenderElementProps, "element"> & { element: AssetElement }) {
	const selected = useSelected();
	const focused = useFocused();
	const Tile = TILES[element.type];
	return (
		<div {...attributes} className="mr-2 mb-2 inline-block align-top">
			<div contentEditable={false} className="flex gap-2 select-none">
				<Tile element={element} selected={selected && focused} />
			</div>
			{children}
		</div>
	);
}
