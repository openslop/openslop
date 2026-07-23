"use client";

import { memo, useState } from "react";
import { ImagePlus, UserPlus } from "@/components/ui/icon";
import { useProject } from "@/lib/project/useProject";
import { useImageUpload } from "@/lib/upload/useImageUpload";
import { AddAssetTile } from "./AddAssetTile";
import {
	CharacterAssetTiles,
	NarratorAssetTile,
	ReferenceAssetTiles,
} from "./AssetTiles";
import { useAssetEditDialogs } from "./character/useAssetEditDialogs";
import { CollapsibleHeader } from "./CollapsibleHeader";

function AssetsSectionComponent() {
	const hydrated = useProject((s) => s.hydrated);
	const addReferenceImages = useProject((s) => s.addReferenceImages);
	const [collapsed, setCollapsed] = useState(false);
	const { openCreateCharacter, editCharacter, openNarrator, dialogs } =
		useAssetEditDialogs();

	const { openPicker, uploading, inputElement } = useImageUpload({
		multiple: true,
		onUpload: addReferenceImages,
	});

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
					<NarratorAssetTile onEdit={openNarrator} />
					<CharacterAssetTiles onEdit={editCharacter} />
					<AddAssetTile
						label="Character"
						ariaLabel="Add character"
						Icon={UserPlus}
						onClick={openCreateCharacter}
					/>
					<ReferenceAssetTiles />
					<AddAssetTile
						label="Reference"
						ariaLabel="Add reference image"
						Icon={ImagePlus}
						onClick={openPicker}
						disabled={uploading}
						busy={uploading}
					/>
					{inputElement}
				</div>
			)}
			{dialogs}
		</section>
	);
}

export const AssetsSection = memo(AssetsSectionComponent);
