"use client";

import { memo, useState } from "react";
import { UserPlus } from "@/components/ui/icon";
import { useProject } from "@/lib/project/useProject";
import { AddAssetTile } from "./AddAssetTile";
import {
	ArtStyleAssetTile,
	CharacterAssetTiles,
	NarratorAssetTile,
} from "./AssetTiles";
import { useAssetEditDialogs } from "./character/useAssetEditDialogs";
import { CollapsibleHeader } from "./CollapsibleHeader";
import { ReferenceImages } from "./ReferenceImages";

function AssetsSectionComponent() {
	const hydrated = useProject((s) => s.hydrated);
	const [collapsed, setCollapsed] = useState(false);
	const {
		openCreateCharacter,
		editCharacter,
		openNarrator,
		openArtStyle,
		dialogs,
	} = useAssetEditDialogs();

	if (!hydrated) return null;

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
					<ArtStyleAssetTile onEdit={openArtStyle} />
					<NarratorAssetTile onEdit={openNarrator} />
					<CharacterAssetTiles onEdit={editCharacter} />
					<AddAssetTile
						label="Character"
						ariaLabel="Add character"
						Icon={UserPlus}
						onClick={openCreateCharacter}
					/>
					<ReferenceImages />
				</div>
			)}
			{dialogs}
		</section>
	);
}

export const AssetsSection = memo(AssetsSectionComponent);
