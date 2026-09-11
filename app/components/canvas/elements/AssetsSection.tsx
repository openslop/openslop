"use client";

import { memo, useState } from "react";
import {
	AddCharacterTile,
	ArtStyleAssetTile,
	CharacterAssetTiles,
	NarratorAssetTile,
} from "./AssetTiles";
import { CollapsibleHeader } from "./CollapsibleHeader";
import { ReferenceImages } from "./ReferenceImages";

function AssetsSectionComponent() {
	const [collapsed, setCollapsed] = useState(false);

	return (
		<section className="group/collapsible mb-4 select-none" aria-label="Assets">
			<CollapsibleHeader
				label="Assets"
				collapsed={collapsed}
				onToggle={() => setCollapsed((c) => !c)}
				ariaLabel={collapsed ? "Expand assets" : "Collapse assets"}
			/>
			{!collapsed && (
				<div className="flex flex-wrap gap-2">
					<ArtStyleAssetTile />
					<NarratorAssetTile />
					<CharacterAssetTiles />
					<AddCharacterTile />
					<ReferenceImages />
				</div>
			)}
		</section>
	);
}

export const AssetsSection = memo(AssetsSectionComponent);
