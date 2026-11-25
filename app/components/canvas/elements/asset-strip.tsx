"use client";

import type { ReactNode } from "react";
import type { Editor } from "slate";
import { useSlateSelector, useSlateStatic } from "slate-react";
import { shallow } from "zustand/shallow";
import { Plus } from "@/components/ui/icon";
import {
	Thumbnail,
	ThumbnailCaption,
	ThumbnailFace,
} from "@/components/ui/thumbnail";
import { getPictures } from "@/lib/canvas/assets";
import { useAllAssetNames, useHasAsset } from "@/lib/canvas/use-assets";
import { getPrimaryUrl } from "@/lib/connectors/asset-url";
import { useQueueSelector } from "@/lib/generation/generation-queue-provider";
import type { MediaItem } from "@/lib/project/media";
import { useProject } from "@/lib/project/use-project";
import { useReferenceImages } from "../hooks/use-reference-images";
import { useEditorPanel } from "../panel/editor-panel-context";
import { deleteNamed } from "./delete-asset";
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

/** Opens the Assets panel, which adds every kind of asset; so the strip shows even before there are any. */
export function AssetStripAdd() {
	const { setActive } = useEditorPanel();
	return (
		<li>
			<Thumbnail asChild>
				<button
					type="button"
					onClick={() => setActive("assets")}
					className="focus-ring rounded-md"
				>
					<ThumbnailFace look="dashed">
						<Plus className="size-5" />
					</ThumbnailFace>
					<ThumbnailCaption>Add asset</ThumbnailCaption>
				</button>
			</Thumbnail>
		</li>
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

export function AssetStripNamed() {
	const editor = useSlateStatic();
	const names = useAllAssetNames();
	return names.map((name) => (
		<li key={name}>
			<NamedAssetTile name={name} onDelete={() => deleteNamed(editor, name)} />
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

const pictureIdsOf = (editor: Editor) =>
	getPictures(editor.children).map((asset) => asset.id);

/** Whether a reference or a picture tile already shows the file at `url`. */
function useShownAsAsset(url: string): boolean {
	const { urls } = useReferenceImages();
	const pictureIds = useSlateSelector(pictureIdsOf, shallow);
	const isPicture = useQueueSelector((q) =>
		pictureIds.some(
			(id) => getPrimaryUrl(q.getElementSnapshot(id).result, "image") === url,
		),
	);
	return urls.includes(url) || isPicture;
}

function AssetStripMediaItem({ item }: { item: MediaItem }) {
	if (useShownAsAsset(item.url)) return null;
	return (
		<li>
			<LibraryMediaTile item={item} />
		</li>
	);
}

/** The project's media, each file once: what a reference or picture tile shows isn't listed again. */
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
