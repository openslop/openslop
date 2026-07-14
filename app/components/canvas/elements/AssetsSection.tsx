"use client";

import { memo, useState } from "react";
import { ImagePlus, Mic, Palette, User, UserPlus } from "@/components/ui/icon";
import { useConfig } from "@/lib/config/ConfigProvider";
import { getProjectStore, useProjectStore } from "@/lib/project/store";
import { characterAvatarElementId } from "@/lib/project/ensureCharacterAvatars";
import { useImageUpload } from "@/lib/upload/useImageUpload";
import { AddAssetTile } from "./AddAssetTile";
import { AssetTile } from "./AssetTile";
import { useAssetEditDialogs } from "./character/useAssetEditDialogs";
import { CollapsibleHeader } from "./CollapsibleHeader";

function AssetsSectionComponent() {
	const { projectId } = useConfig();
	const hydrated = useProjectStore(projectId, (s) => s.hydrated);
	const characters = useProjectStore(projectId, (s) => s.metadata.characters);
	const referenceImages = useProjectStore(projectId, (s) => s.referenceImages);
	const removeReferenceImage = useProjectStore(
		projectId,
		(s) => s.removeReferenceImage,
	);
	const [collapsed, setCollapsed] = useState(false);
	const { openCreateCharacter, editCharacter, openNarrator, dialogs } =
		useAssetEditDialogs();

	const { openPicker, uploading, inputElement } = useImageUpload({
		multiple: true,
		onUpload: (urls) => {
			const store = getProjectStore(projectId).getState();
			store.setReferenceImages([...store.referenceImages, ...urls]);
		},
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
					<AssetTile
						name="Narrator"
						Icon={Mic}
						fallback="icon"
						onEdit={openNarrator}
					/>
					{Object.entries(characters).map(([name, ch]) => (
						<AssetTile
							key={`character:${name}`}
							name={name}
							previewUrl={ch.avatarUrl}
							Icon={User}
							elementId={characterAvatarElementId(name)}
							onEdit={() => editCharacter(name)}
						/>
					))}
					<AddAssetTile
						label="Character"
						ariaLabel="Add character"
						Icon={UserPlus}
						onClick={openCreateCharacter}
					/>
					{referenceImages.map((url, i) => (
						<AssetTile
							key={`style:${url}`}
							name={`Reference ${i + 1}`}
							previewUrl={url}
							Icon={Palette}
							onRemove={() => removeReferenceImage(i)}
						/>
					))}
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
