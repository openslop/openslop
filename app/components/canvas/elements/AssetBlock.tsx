"use client";

import type { ReactNode } from "react";
import { useFocused, useSelected, type RenderElementProps } from "slate-react";
import { getElementBodyText } from "@/lib/canvas/osmlSerializer";
import type { AssetElement, AssetType } from "@/lib/canvas/types";
import { ProjectTitle } from "../ProjectTitle";
import {
	CharacterAssetTile,
	ReferenceAssetTiles,
	ArtStyleAssetTile,
} from "./AssetTiles";

type ViewProps = Omit<RenderElementProps, "element"> & {
	element: AssetElement;
	selected: boolean;
};

type TileProps = Pick<ViewProps, "element" | "selected">;

const tile = (render: (props: TileProps) => ReactNode) =>
	function Tile({ attributes, children, element, selected }: ViewProps) {
		return (
			<div {...attributes} className="mr-2 mb-2 inline-block align-top">
				<div contentEditable={false} className="flex gap-2 select-none">
					{render({ element, selected })}
				</div>
				{children}
			</div>
		);
	};

const VIEWS: Record<AssetType, (props: ViewProps) => ReactNode> = {
	asset_title: ({ attributes, children, element }) => (
		<div {...attributes}>
			<ProjectTitle empty={getElementBodyText(element) === ""}>
				{children}
			</ProjectTitle>
		</div>
	),
	asset_style: tile(({ selected }) => (
		<ArtStyleAssetTile selected={selected} />
	)),
	asset_character: tile(({ element, selected }) => (
		<CharacterAssetTile character={element} selected={selected} />
	)),
	asset_references: tile(({ selected }) => (
		<ReferenceAssetTiles selected={selected} />
	)),
};

export function AssetBlock({
	element,
	...props
}: Omit<RenderElementProps, "element"> & { element: AssetElement }) {
	const selected = useSelected();
	const focused = useFocused();
	const View = VIEWS[element.type];
	return <View {...props} element={element} selected={selected && focused} />;
}
