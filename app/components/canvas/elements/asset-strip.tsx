"use client";

import type { ReactNode } from "react";
import { useSlateStatic } from "slate-react";
import { useCharacterNames, useHasAsset } from "@/lib/canvas/use-assets";
import { useProject } from "@/lib/project/use-project";
import { useReferenceImages } from "../hooks/use-reference-images";
import { deleteCharacter } from "./character/delete-character";
import { UploadingTile } from "./uploading-tile";
import {
	ArtStyleAssetTile,
	CharacterAssetTile,
	MediaAssetTile,
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
				onRemove={() => references.remove(index)}
			/>
		</li>
	));
}

export function AssetStripMedia() {
	const media = useProject((state) => state.media);
	return media.map((item) => (
		<li key={item.name}>
			<MediaAssetTile item={item} />
		</li>
	));
}

export function AssetStripUploading({ count }: { count: number }) {
	return Array.from({ length: count }, (_, i) => (
		<li key={i}>
			<UploadingTile />
		</li>
	));
}
