"use client";

import { memo, useState } from "react";
import { useProject } from "@/lib/project/useProject";
import {
	AddCharacterTile,
	ArtStyleAssetTile,
	CharacterAssetTiles,
	NarratorAssetTile,
} from "./AssetTiles";
import { AssetEditProvider } from "./character/AssetEditProvider";
import { CollapsibleHeader } from "./CollapsibleHeader";
import { ReferenceImages } from "./ReferenceImages";

function AssetsSectionComponent() {
	const hydrated = useProject((s) => s.hydrated);
	const [collapsed, setCollapsed] = useState(false);

	if (!hydrated) return null;

	return (
		<AssetEditProvider>
			<section
				className="group/collapsible mb-4 select-none"
				aria-label="Assets"
			>
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
		</AssetEditProvider>
	);
}

export const AssetsSection = memo(AssetsSectionComponent);
