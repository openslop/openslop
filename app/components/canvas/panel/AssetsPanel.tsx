"use client";

import { Loader2, Plus } from "@/components/ui/icon";
import { TooltipIconButton } from "@/components/ui/icon-button";
import { useCastNames } from "@/lib/canvas/useAssets";
import { useImageUpload } from "@/lib/upload/useImageUpload";
import { useReferenceImages } from "../hooks/useReferenceImages";
import { CharacterAssetTile, ReferenceTile } from "../elements/AssetTiles";
import { useAssetEditors } from "../elements/character/AssetEditProvider";
import { PagedTiles } from "./PagedTiles";
import { PanelCard } from "./PanelCard";

function CharactersCard() {
	const { openCreateCharacter } = useAssetEditors();
	const names = useCastNames();
	return (
		<PanelCard
			title="Characters"
			action={
				<TooltipIconButton
					label="Add character"
					size="header"
					variant="quiet"
					onClick={openCreateCharacter}
				>
					<Plus size={14} />
				</TooltipIconButton>
			}
		>
			<PagedTiles label="Characters" empty="No characters yet">
				{names.map((name) => (
					<CharacterAssetTile key={name} name={name} fill />
				))}
			</PagedTiles>
		</PanelCard>
	);
}

function ReferencesCard() {
	const { urls, add, remove } = useReferenceImages();
	const { openPicker, uploading, inputElement } = useImageUpload({
		multiple: true,
		onUpload: add,
	});
	return (
		<PanelCard
			title="References"
			action={
				<TooltipIconButton
					label="Add reference image"
					size="header"
					variant="quiet"
					disabled={uploading}
					onClick={openPicker}
				>
					{uploading ? (
						<Loader2 size={14} className="animate-spin" />
					) : (
						<Plus size={14} />
					)}
				</TooltipIconButton>
			}
		>
			{inputElement}
			<PagedTiles label="References" empty="No reference images yet">
				{urls.map((url, index) => (
					<ReferenceTile
						key={`${index}:${url}`}
						url={url}
						index={index}
						onRemove={() => remove(index)}
						fill
					/>
				))}
			</PagedTiles>
		</PanelCard>
	);
}

export function AssetsPanel() {
	return (
		<>
			<CharactersCard />
			<ReferencesCard />
		</>
	);
}
