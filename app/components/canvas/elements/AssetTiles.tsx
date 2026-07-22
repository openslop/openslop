"use client";

import { Mic, Palette, User } from "@/components/ui/icon";
import { characterAvatarElementId } from "@/lib/project/ensureCharacterAvatars";
import { useProject } from "@/lib/project/useProject";
import { AssetTile } from "./AssetTile";

export function NarratorAssetTile({ onEdit }: { onEdit: () => void }) {
	return (
		<AssetTile name="Narrator" Icon={Mic} fallback="icon" onEdit={onEdit} />
	);
}

export function CharacterAssetTiles({
	onEdit,
	onRemove,
}: {
	onEdit: (name: string) => void;
	onRemove?: (name: string) => void;
}) {
	const characters = useProject((s) => s.metadata.characters);
	return Object.entries(characters).map(([name, character]) => (
		<AssetTile
			key={`character:${name}`}
			name={name}
			previewUrl={character.avatarUrl}
			Icon={User}
			elementId={characterAvatarElementId(name)}
			onEdit={() => onEdit(name)}
			onRemove={onRemove && (() => onRemove(name))}
			removeAffordance="corner"
		/>
	));
}

export function ReferenceAssetTiles() {
	const referenceImages = useProject((s) => s.referenceImages);
	const removeReferenceImage = useProject((s) => s.removeReferenceImage);
	return referenceImages.map((url, index) => (
		<AssetTile
			key={`reference:${url}`}
			name={`Reference ${index + 1}`}
			previewUrl={url}
			Icon={Palette}
			onRemove={() => removeReferenceImage(index)}
		/>
	));
}
