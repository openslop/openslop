"use client";

import type { ReactNode } from "react";
import type { Editor } from "slate";
import { useSlateSelector, useSlateStatic } from "slate-react";
import { shallow } from "zustand/shallow";
import { getAssets } from "@/lib/canvas/assets";
import { useCharacterNames, useHasAsset } from "@/lib/canvas/use-assets";
import { getPrimaryUrl } from "@/lib/connectors/asset-url";
import { useQueueSelector } from "@/lib/generation/generation-queue-provider";
import type { MediaItem } from "@/lib/project/media";
import { useProject } from "@/lib/project/use-project";
import { useReferenceImages } from "../hooks/use-reference-images";
import { deleteCharacter } from "./delete-asset";
import { UploadingTile } from "./uploading-tile";
import {
	ArtStyleAssetTile,
	CharacterAssetTile,
	LibraryMediaTile,
	ReferenceAssetTile,
} from "./asset-tiles";

export function AssetStrip({ children }: { children: ReactNode }) {
	return (
		<ul aria-label="Assets" className="flex flex-wrap gap-2 pb-2 empty:hidden">
			{children}
		</ul>
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

export function AssetStripCharacters() {
	const editor = useSlateStatic();
	const names = useCharacterNames();
	return names.map((name) => (
		<li key={name}>
			<CharacterAssetTile
				name={name}
				onDelete={() => deleteCharacter(editor, name)}
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
				onDelete={() => references.remove(index)}
			/>
		</li>
	));
}

const avatarIdsOf = (editor: Editor) =>
	getAssets(editor.children)
		.filter((asset) => asset.type === "asset_avatar")
		.map((asset) => asset.id);

/** Whether a reference or an avatar tile already shows the file at `url`. */
function useShownAsAsset(url: string): boolean {
	const { urls } = useReferenceImages();
	const avatarIds = useSlateSelector(avatarIdsOf, shallow);
	const isAvatar = useQueueSelector((q) =>
		avatarIds.some(
			(id) => getPrimaryUrl(q.getElementSnapshot(id).result, "image") === url,
		),
	);
	return urls.includes(url) || isAvatar;
}

function AssetStripMediaItem({ item }: { item: MediaItem }) {
	if (useShownAsAsset(item.url)) return null;
	return (
		<li>
			<LibraryMediaTile item={item} />
		</li>
	);
}

/** The project's media, each file once: what a reference or avatar tile shows isn't listed again. */
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
