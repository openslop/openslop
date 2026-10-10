"use client";

import type { ReactNode } from "react";
import { Loader2, Plus } from "@/components/ui/icon";
import { TooltipIconButton } from "@/components/ui/icon-button";
import { useCharacterNames, useHasAsset } from "@/lib/canvas/use-assets";
import { useImageUpload } from "@/lib/upload/use-image-upload";
import { useReferenceImages } from "../hooks/use-reference-images";
import {
	ArtStyleAssetTile,
	CharacterAssetTile,
	ReferenceAssetTile,
} from "../elements/asset-tiles";
import { useAssetEditors } from "../elements/character/asset-edit-provider";
import { PagedTiles } from "./paged-tiles";
import { PanelCard } from "./panel-card";

function AssetCard({
	title,
	empty,
	add,
	children,
}: {
	title: string;
	empty: string;
	add?: { label: string; onClick: () => void; busy?: boolean };
	children: ReactNode[];
}) {
	return (
		<PanelCard
			title={title}
			action={
				add && (
					<TooltipIconButton
						label={add.label}
						size="header"
						variant="quiet"
						disabled={add.busy}
						onClick={add.onClick}
					>
						{add.busy ? (
							<Loader2 size={14} className="animate-spin" />
						) : (
							<Plus size={14} />
						)}
					</TooltipIconButton>
				)
			}
		>
			<PagedTiles label={title} empty={empty}>
				{children}
			</PagedTiles>
		</PanelCard>
	);
}

function CharactersCard() {
	const { openCreateCharacter } = useAssetEditors();
	const names = useCharacterNames();
	return (
		<AssetCard
			title="Characters"
			empty="No characters yet"
			add={{ label: "Add character", onClick: openCreateCharacter }}
		>
			{names.map((name) => (
				<CharacterAssetTile key={name} name={name} fill />
			))}
		</AssetCard>
	);
}

function ReferencesCard() {
	const { urls, add, remove } = useReferenceImages();
	const { openPicker, uploading, inputElement } = useImageUpload({
		multiple: true,
		onUpload: add,
	});
	return (
		<>
			{inputElement}
			<AssetCard
				title="References"
				empty="No reference images yet"
				add={{
					label: "Add reference image",
					onClick: openPicker,
					busy: uploading,
				}}
			>
				{urls.map((url, index) => (
					<ReferenceAssetTile
						key={url}
						url={url}
						index={index}
						onRemove={() => remove(index)}
						fill
					/>
				))}
			</AssetCard>
		</>
	);
}

function ArtStyleCard() {
	const { editAsset } = useAssetEditors();
	const hasStyle = useHasAsset("asset_style");
	return (
		<AssetCard
			title="Art style"
			empty="No art style yet"
			add={
				hasStyle
					? undefined
					: { label: "Add art style", onClick: () => editAsset("asset_style") }
			}
		>
			{hasStyle ? [<ArtStyleAssetTile key="asset_style" fill />] : []}
		</AssetCard>
	);
}

export function AssetsPanel() {
	return (
		<>
			<ArtStyleCard />
			<CharactersCard />
			<ReferencesCard />
		</>
	);
}
