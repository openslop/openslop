"use client";

import { useState } from "react";
import { Mic, Palette, User } from "@/components/ui/icon";
import { AssetTile } from "@/app/components/canvas/elements/AssetTile";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { characterAvatarElementId } from "@/lib/project/ensureCharacterAvatars";
import { useConfig } from "@/lib/config/ConfigProvider";
import { useGenerationQueue } from "@/lib/generation/GenerationQueueProvider";
import { deleteCharacter } from "@/lib/project/deleteCharacter";
import { useProject } from "@/lib/project/useProject";

interface ComposerAssetsProps {
	uploadingCount: number;
	onEditCharacter: (name: string) => void;
	onEditNarrator: () => void;
}

export function ComposerAssets({
	uploadingCount,
	onEditCharacter,
	onEditNarrator,
}: ComposerAssetsProps) {
	const { projectId } = useConfig();
	const queue = useGenerationQueue();
	const referenceImages = useProject((s) => s.referenceImages);
	const characters = useProject((s) => s.metadata.characters);
	const narration = useProject((s) => s.metadata.narration);
	const removeReferenceImage = useProject((s) => s.removeReferenceImage);

	const [deletingName, setDeletingName] = useState<string>();

	const hasNarration = Object.keys(narration).length > 0;
	const characterEntries = Object.entries(characters);

	const confirmDelete = () => {
		if (deletingName) deleteCharacter(projectId, queue, deletingName);
		setDeletingName(undefined);
	};

	return (
		<div className="flex flex-wrap gap-2 pb-2">
			{hasNarration && (
				<AssetTile
					name="Narrator"
					Icon={Mic}
					fallback="icon"
					onEdit={onEditNarrator}
				/>
			)}
			{characterEntries.map(([name, ch]) => (
				<AssetTile
					key={`character:${name}`}
					name={name}
					previewUrl={ch.avatarUrl}
					Icon={User}
					elementId={characterAvatarElementId(name)}
					onEdit={() => onEditCharacter(name)}
					onRemove={() => setDeletingName(name)}
					removeAffordance="corner"
				/>
			))}
			{referenceImages.map((url, i) => (
				<AssetTile
					key={`ref:${url}`}
					name={`Reference ${i + 1}`}
					previewUrl={url}
					Icon={Palette}
					onRemove={() => removeReferenceImage(i)}
				/>
			))}
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
