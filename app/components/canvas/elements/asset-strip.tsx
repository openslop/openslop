"use client";

import { useSlateStatic } from "slate-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useCharacterNames, useHasAsset } from "@/lib/canvas/use-assets";
import { useReferenceImages } from "../hooks/use-reference-images";
import { deleteCharacter } from "./character/delete-character";
import {
	ArtStyleAssetTile,
	CharacterAssetTile,
	ReferenceAssetTile,
} from "./asset-tiles";

export function AssetStrip({
	uploadingCount = 0,
}: {
	uploadingCount?: number;
}) {
	const editor = useSlateStatic();
	const names = useCharacterNames();
	const references = useReferenceImages();
	const hasArtStyle = useHasAsset("asset_style");

	return (
		<ul aria-label="Assets" className="flex flex-wrap gap-2 pb-2 empty:hidden">
			{hasArtStyle && (
				<li>
					<ArtStyleAssetTile />
				</li>
			)}
			{names.map((name) => (
				<li key={name}>
					<CharacterAssetTile
						name={name}
						onRemove={() => deleteCharacter(editor, name)}
					/>
				</li>
			))}
			{references.urls.map((url, index) => (
				<li key={`reference:${url}`}>
					<ReferenceAssetTile
						url={url}
						index={index}
						onRemove={() => references.remove(index)}
					/>
				</li>
			))}
			{Array.from({ length: uploadingCount }).map((_, i) => (
				<li key={`uploading:${i}`} aria-hidden>
					<Skeleton className="aspect-square w-16 shrink-0 sm:w-20" />
				</li>
			))}
		</ul>
	);
}
