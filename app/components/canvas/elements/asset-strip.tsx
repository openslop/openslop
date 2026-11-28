"use client";

import type { ReactNode } from "react";
import type { Editor } from "slate";
import { useSlateSelector, useSlateStatic } from "slate-react";
import { shallow } from "zustand/shallow";
import { AddButton } from "@/components/ui/add-button";
import { EmptyState } from "@/components/ui/empty-state";
import { FolderOpen } from "@/components/ui/icon";
import { getImageAssets } from "@/lib/canvas/assets";
import { useNamedAssetNames, useHasAsset } from "@/lib/canvas/use-assets";
import { getPrimaryUrl } from "@/lib/connectors/asset-url";
import { useQueueSelector } from "@/lib/generation/generation-queue-provider";
import type { MediaItem } from "@/lib/project/media";
import { useProject } from "@/lib/project/use-project";
import { useReferenceImages } from "../hooks/use-reference-images";
import { useEditorPanel } from "../panel/editor-panel-context";
import { deleteNamedAsset } from "./delete-asset";
import { UploadingTile } from "./uploading-tile";
import {
	ArtStyleAssetTile,
	LibraryMediaTile,
	NamedAssetTile,
	ReferenceAssetTile,
} from "./asset-tiles";

export function AssetStrip({ children }: { children: ReactNode }) {
	return (
		<ul aria-label="Assets" className="flex flex-wrap gap-2 pb-1 empty:hidden">
			{children}
		</ul>
	);
}

export function AssetCanvasStrip() {
	const { setActive } = useEditorPanel();
	const hasArtStyle = useHasAsset("asset_style");
	const names = useNamedAssetNames();
	const { urls } = useReferenceImages();
	const hasAssets = hasArtStyle || names.length > 0 || urls.length > 0;
	return (
		<div className="flex items-start gap-2">
			<div className="min-w-0 flex-1">
				{hasAssets ? (
					<AssetStrip>
						<AssetStripArtStyle />
						<AssetStripNamedAssets />
						<AssetStripReferences />
					</AssetStrip>
				) : (
					<EmptyState
						icon={FolderOpen}
						title="No assets yet"
						description="Assets you add show up here"
					/>
				)}
			</div>
			<AddButton label="Add asset" onClick={() => setActive("assets")} />
		</div>
	);
}

export function AssetStripArtStyle() {
	if (!useHasAsset("asset_style")) return null;
	return (
		<li>
			<ArtStyleAssetTile />
		</li>
	);
}

export function AssetStripNamedAssets() {
	const editor = useSlateStatic();
	const names = useNamedAssetNames();
	return names.map((name) => (
		<li key={name}>
			<NamedAssetTile
				name={name}
				onDelete={() => deleteNamedAsset(editor, name)}
			/>
		</li>
	));
}

export function AssetStripReferences() {
	const references = useReferenceImages();
	return references.urls.map((url, index) => (
		<li key={url}>
			<ReferenceAssetTile
				url={url}
				index={index}
				onRemove={() => references.remove(index)}
			/>
		</li>
	));
}

const imageAssetIdsOf = (editor: Editor) =>
	getImageAssets(editor.children).map((asset) => asset.id);

/** Whether a reference or an image asset's tile already shows the file at `url`. */
function useShownAsAsset(url: string): boolean {
	const { urls } = useReferenceImages();
	const imageAssetIds = useSlateSelector(imageAssetIdsOf, shallow);
	const shownByImageAsset = useQueueSelector((q) =>
		imageAssetIds.some(
			(id) => getPrimaryUrl(q.getElementSnapshot(id).result, "image") === url,
		),
	);
	return urls.includes(url) || shownByImageAsset;
}

function AssetStripMediaItem({ item }: { item: MediaItem }) {
	if (useShownAsAsset(item.url)) return null;
	return (
		<li>
			<LibraryMediaTile item={item} />
		</li>
	);
}

/** The project's media, each file once: what a reference or image asset's tile shows isn't listed again. */
export function AssetStripMedia() {
	const media = useProject((state) => state.media);
	return media.map((item) => (
		<AssetStripMediaItem key={item.name} item={item} />
	));
}

export function AssetStripUploading({ count }: { count: number }) {
	return Array.from({ length: count }, (_, i) => (
		<li key={i} aria-hidden>
			<UploadingTile />
		</li>
	));
}
