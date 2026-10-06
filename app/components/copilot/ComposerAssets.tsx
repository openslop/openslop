"use client";

import { useState } from "react";
import {
	CharacterAssetTile,
	ReferenceAssetTiles,
	ArtStyleAssetTile,
} from "@/app/components/canvas/elements/AssetTiles";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useSlateSelector, useSlateStatic } from "slate-react";
import { removeAsset } from "@/lib/canvas/assetOps";
import { assetText } from "@/lib/canvas/assets";
import { useCharacters } from "@/lib/canvas/useAssets";

export function ComposerAssets({ uploadingCount }: { uploadingCount: number }) {
	const editor = useSlateStatic();
	const characters = useCharacters();
	const hasArtStyle = useSlateSelector(
		(editor) => assetText(editor.children, "asset_style") !== "",
	);

	const [deletingName, setDeletingName] = useState<string>();

	return (
		<div className="flex flex-wrap gap-2 pb-2">
			{hasArtStyle && <ArtStyleAssetTile />}
			{characters.map((character) => (
				<CharacterAssetTile
					key={character.id}
					character={character}
					onRemove={() =>
						setDeletingName(character.generationAttributes?.name ?? "")
					}
				/>
			))}
			<ReferenceAssetTiles />
			{Array.from({ length: uploadingCount }).map((_, i) => (
				<Skeleton key={i} className="aspect-square w-16 shrink-0 sm:w-20" />
			))}
			<ConfirmDeleteDialog
				target={deletingName}
				onClose={() => setDeletingName(undefined)}
				title={(name) => `Delete ${name}?`}
				description="This removes the character and their avatar."
				actionLabel="Delete character"
				onConfirm={(name) => removeAsset(editor, "asset_character", name)}
			/>
		</div>
	);
}
