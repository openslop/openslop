"use client";

import type { ReactNode } from "react";
import { Plus } from "@/components/ui/icon";
import { ICON_SIZES, TooltipIconButton } from "@/components/ui/icon-button";
import { Spinner } from "@/components/ui/spinner";
import { useCharacterNames, useHasAsset } from "@/lib/canvas/use-assets";
import { useMediaUpload } from "@/lib/project/use-media-upload";
import { useProject } from "@/lib/project/use-project";
import { UploadKindSchema } from "@/lib/upload/upload-files";
import { useReferenceImages } from "../hooks/use-reference-images";
import {
	ArtStyleAssetTile,
	MediaAssetTile,
	CharacterAssetTile,
	ReferenceAssetTile,
} from "../elements/asset-tiles";
import { useAssetEditors } from "../elements/asset-edit-context";
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
							<Spinner size={ICON_SIZES.header} />
						) : (
							<Plus size={ICON_SIZES.header} />
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
	const { openPicker, uploading, inputElement } = useMediaUpload({
		kinds: ["image"],
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

function MediaCard() {
	const media = useProject((state) => state.media);
	const { openPicker, uploading, inputElement } = useMediaUpload({
		kinds: UploadKindSchema.options,
		multiple: true,
	});
	return (
		<>
			{inputElement}
			<AssetCard
				title="Media"
				empty="Nothing uploaded yet"
				add={{ label: "Upload media", onClick: openPicker, busy: uploading }}
			>
				{media.map((item) => (
					<MediaAssetTile key={item.name} item={item} fill />
				))}
			</AssetCard>
		</>
	);
}

export function AssetsPanel() {
	return (
		<>
			<ArtStyleCard />
			<CharactersCard />
			<ReferencesCard />
			<MediaCard />
		</>
	);
}
