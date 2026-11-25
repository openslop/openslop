"use client";

import type { ReactNode } from "react";
import { useSlateStatic } from "slate-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Palette } from "@/components/ui/icon";
import {
	ASSET_KIND_SPECS,
	ASSET_KINDS,
	type AssetKind,
} from "@/lib/canvas/assets";
import { useAssetNames, useHasAsset } from "@/lib/canvas/use-assets";
import { useMediaUpload } from "@/lib/project/use-media-upload";
import { useReferenceImages } from "../hooks/use-reference-images";
import {
	ArtStyleAssetTile,
	NamedAssetTile,
	ReferenceAssetTile,
} from "../elements/asset-tiles";
import { useAssetEditors } from "../elements/asset-edit-context";
import { ASSET_KIND_ICONS } from "../elements/asset-kinds";
import { deleteNamed } from "../elements/delete-asset";
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

function NamedAssetsCard({ kind }: { kind: AssetKind }) {
	const editor = useSlateStatic();
	const { openCreateAsset } = useAssetEditors();
	const names = useAssetNames(kind);
	const { label, plural } = ASSET_KIND_SPECS[kind];
	return (
		<AssetCard
			title={plural}
			empty={
				<EmptyState
					icon={ASSET_KIND_ICONS[kind]}
					title={`No ${plural.toLowerCase()} yet`}
					description={`${plural} you create show up here`}
				/>
			}
			action={
				<AddButton
					label={`Add ${label.toLowerCase()}`}
					onClick={() => openCreateAsset({ kind })}
				/>
			}
		>
			{names.map((name) => (
				<NamedAssetTile
					key={name}
					name={name}
					onDelete={() => deleteNamed(editor, name)}
				/>
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
							onRemove={() => remove(index)}
						/>
					)),
					...uploadingTiles(uploading),
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

export function AssetsPanel() {
	return (
		<>
			<ArtStyleCard />
			{ASSET_KINDS.map((kind) => (
				<NamedAssetsCard key={kind} kind={kind} />
			))}
			<ReferencesCard />
		</>
	);
}
