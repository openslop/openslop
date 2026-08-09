"use client";

import { useState } from "react";
import {
	ArtStyleAssetTile,
	CharacterAssetTiles,
	NarratorAssetTile,
	ReferenceAssetTiles,
} from "@/app/components/canvas/elements/AssetTiles";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { useConfig } from "@/lib/config/ConfigProvider";
import { useGenerationQueue } from "@/lib/generation/GenerationQueueProvider";
import { deleteCharacter } from "@/lib/project/deleteCharacter";
import { useProject } from "@/lib/project/useProject";

interface ComposerAssetsProps {
	uploadingCount: number;
	onEditCharacter: (name: string) => void;
	onEditNarrator: () => void;
	onEditArtStyle: () => void;
}

export function ComposerAssets({
	uploadingCount,
	onEditCharacter,
	onEditNarrator,
	onEditArtStyle,
}: ComposerAssetsProps) {
	const { projectId } = useConfig();
	const queue = useGenerationQueue();
	const narration = useProject((s) => s.metadata.narration);
	const hasArtStyle = useProject((s) => Boolean(s.metadata.style.trim()));

	const [deletingName, setDeletingName] = useState<string>();

	const hasNarration = Object.keys(narration).length > 0;

	const confirmDelete = () => {
		if (deletingName) deleteCharacter(projectId, queue, deletingName);
		setDeletingName(undefined);
	};

	return (
		<div className="flex flex-wrap gap-2 pb-2">
			{hasArtStyle && <ArtStyleAssetTile onEdit={onEditArtStyle} />}
			{hasNarration && <NarratorAssetTile onEdit={onEditNarrator} />}
			<CharacterAssetTiles
				onEdit={onEditCharacter}
				onRemove={setDeletingName}
			/>
			<ReferenceAssetTiles />
			{Array.from({ length: uploadingCount }).map((_, i) => (
				<div
					key={i}
					className="aspect-square w-16 shrink-0 rounded-md shimmer-surface sm:w-20"
				/>
			))}
			<ConfirmDeleteDialog
				open={deletingName !== undefined}
				onOpenChange={(open) => {
					if (!open) setDeletingName(undefined);
				}}
				title={`Delete ${deletingName}?`}
				description="This permanently removes the character and its avatar. It can't be undone."
				actionLabel="Delete character"
				onConfirm={confirmDelete}
			/>
		</div>
	);
}
