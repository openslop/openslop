"use client";

import type { ReactNode } from "react";
import { useSlateStatic } from "slate-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Palette, User } from "@/components/ui/icon";
import { useCharacterNames, useHasAsset } from "@/lib/canvas/use-assets";
import { useMediaLibrary } from "@/lib/project/use-media-library";
import { useMediaUpload } from "@/lib/project/use-media-upload";
import { useReferenceImages } from "../hooks/use-reference-images";
import {
	ArtStyleAssetTile,
	MediaLibraryItem,
	CharacterAssetTile,
	ReferenceAssetTile,
} from "../elements/asset-tiles";
import { useAssetEditors } from "../elements/asset-edit-context";
import { deleteCharacter } from "../elements/delete-asset";
import {
	EmptyLibrary,
	MEDIA_KINDS,
	MediaLibraryFilter,
} from "../elements/media-kinds";
import { uploadingTiles } from "../elements/uploading-tile";
import { AddMediaMenu } from "../elements/add-media-menu";
import { NoReferenceImages } from "../elements/reference-images";
import { PagedTiles } from "./paged-tiles";
import { PanelCard } from "./panel-card";
import { AddButton } from "@/components/ui/add-button";

function AssetCard({
	title,
	empty,
	action,
	children,
}: {
	title: string;
	empty: ReactNode;
	action?: ReactNode;
	children: ReactNode[];
}) {
	return (
		<PanelCard title={title} action={action}>
			<PagedTiles label={title} empty={empty}>
				{children}
			</PagedTiles>
		</PanelCard>
	);
}

function CharactersCard() {
	const editor = useSlateStatic();
	const { openCreateCharacter } = useAssetEditors();
	const names = useCharacterNames();
	return (
		<AssetCard
			title="Characters"
			empty={
				<EmptyState
					icon={User}
					title="No characters yet"
					description="Characters you create show up here"
				/>
			}
			action={<AddButton label="Add character" onClick={openCreateCharacter} />}
		>
			{names.map((name) => (
				<CharacterAssetTile
					key={name}
					name={name}
					onDelete={() => deleteCharacter(editor, name)}
				/>
			))}
		</AssetCard>
	);
}

function ReferencesCard() {
	const { urls, add, remove } = useReferenceImages();
	const { openPicker, uploadingCount, inputElement } = useMediaUpload({
		kinds: ["image"],
		multiple: true,
		onUpload: add,
	});
	return (
		<>
			{inputElement}
			<AssetCard
				title="References"
				empty={<NoReferenceImages />}
				action={
					<AddMediaMenu label="Add reference image" onUpload={openPicker} />
				}
			>
				{[
					...urls.map((url, index) => (
						<ReferenceAssetTile
							key={url}
							url={url}
							index={index}
							onDelete={() => remove(index)}
						/>
					)),
					...uploadingTiles(uploadingCount),
				]}
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
			empty={
				<EmptyState
					icon={Palette}
					title="No art style yet"
					description="The art style you set shows up here"
				/>
			}
			action={
				!hasStyle && (
					<AddButton
						label="Add art style"
						onClick={() => editAsset("asset_style")}
					/>
				)
			}
		>
			{hasStyle ? [<ArtStyleAssetTile key="asset_style" />] : []}
		</AssetCard>
	);
}

function MediaLibraryCard() {
	const {
		kind,
		setKind,
		query,
		setQuery,
		items,
		openPicker,
		uploadingCount,
		inputElement,
	} = useMediaLibrary();
	return (
		<>
			{inputElement}
			<PanelCard
				title="Media library"
				action={<AddMediaMenu label="Add media" onUpload={openPicker} />}
			>
				<MediaLibraryFilter
					kind={kind}
					onKindChange={setKind}
					query={query}
					onQueryChange={setQuery}
				/>
				<PagedTiles
					key={kind}
					label="Media library"
					empty={<EmptyLibrary kind={kind} query={query} />}
					columns={MEDIA_KINDS[kind].columns}
				>
					{[
						...uploadingTiles(uploadingCount, kind),
						...items.map((item) => (
							<MediaLibraryItem key={item.name} item={item} />
						)),
					]}
				</PagedTiles>
			</PanelCard>
		</>
	);
}

export function AssetsPanel() {
	return (
		<>
			<ArtStyleCard />
			<CharactersCard />
			<ReferencesCard />
			<MediaLibraryCard />
		</>
	);
}
