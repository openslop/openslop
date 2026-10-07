"use client";

import { useState } from "react";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useSlateSelector, useSlateStatic } from "slate-react";
import { removeCharacter } from "@/lib/canvas/assetOps";
import { assetText } from "@/lib/canvas/assets";
import { useCharacterNames } from "@/lib/canvas/useAssets";
import { useReferenceImages } from "../hooks/useReferenceImages";
import {
	ArtStyleAssetTile,
	CharacterAssetTile,
	ReferenceAssetTile,
} from "./AssetTiles";

export function AssetStrip({
	uploadingCount = 0,
}: {
	uploadingCount?: number;
}) {
	const editor = useSlateStatic();
	const names = useCharacterNames();
	const references = useReferenceImages();
	const hasArtStyle = useSlateSelector(
		(editor) => assetText(editor.children, "asset_style") !== "",
	);
	const [deletingName, setDeletingName] = useState<string>();

	return (
		<>
			<ul
				aria-label="Assets"
				className="flex flex-wrap gap-2 pb-2 empty:hidden"
			>
				{hasArtStyle && (
					<li>
						<ArtStyleAssetTile />
					</li>
				)}
				{names.map((name) => (
					<li key={name}>
						<CharacterAssetTile
							name={name}
							onRemove={() => setDeletingName(name)}
						/>
					</li>
				))}
				{references.urls.map((url, index) => (
					<li key={`reference:${index}:${url}`}>
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
			<ConfirmDeleteDialog
				target={deletingName}
				onClose={() => setDeletingName(undefined)}
				title={(name) => `Delete ${name}?`}
				description="This removes the character's look and voice."
				actionLabel="Delete character"
				onConfirm={(name) => removeCharacter(editor, name)}
			/>
		</>
	);
}
