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
import { removeCharacter } from "@/lib/canvas/assetOps";
import { assetText } from "@/lib/canvas/assets";
import { useCharacterNames } from "@/lib/canvas/useAssets";

export function ComposerAssets({ uploadingCount }: { uploadingCount: number }) {
	const editor = useSlateStatic();
	const names = useCharacterNames();
	const hasArtStyle = useSlateSelector(
		(editor) => assetText(editor.children, "asset_style") !== "",
	);

	const [deletingName, setDeletingName] = useState<string>();

	return (
		<div className="flex flex-wrap gap-2 pb-2">
			{hasArtStyle && <ArtStyleAssetTile />}
			{names.map((name) => (
				<CharacterAssetTile
					key={name}
					name={name}
					onRemove={() => setDeletingName(name)}
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
				description="This removes the character's look and voice."
				actionLabel="Delete character"
				onConfirm={(name) => removeCharacter(editor, name)}
			/>
		</div>
	);
}
