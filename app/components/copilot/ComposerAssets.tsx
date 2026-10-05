"use client";

import { useState } from "react";
import {
	CharacterAssetTiles,
	ReferenceAssetTiles,
	ArtStyleAssetTile,
} from "@/app/components/canvas/elements/AssetTiles";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useSlateSelector, useSlateStatic } from "slate-react";
import { removeAsset } from "@/lib/canvas/assetOps";
import { assetText } from "@/lib/canvas/assets";

export function ComposerAssets({ uploadingCount }: { uploadingCount: number }) {
	const editor = useSlateStatic();
	const hasArtStyle = useSlateSelector(
		(editor) => assetText(editor.children, "style") !== "",
	);

	const [deletingName, setDeletingName] = useState<string>();

	return (
		<div className="flex flex-wrap gap-2 pb-2">
			{hasArtStyle && <ArtStyleAssetTile />}
			<CharacterAssetTiles onRemove={setDeletingName} />
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
				onConfirm={(name) => removeAsset(editor, "cast", name)}
			/>
		</div>
	);
}
