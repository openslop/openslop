"use client";

import { Image, Mic, Palette, User } from "@/components/ui/icon";
import { useQueueSelector } from "@/lib/generation/GenerationQueueProvider";
import {
	characterAvatarElementId,
	characterAvatarUrl,
} from "@/lib/project/characterAvatar";
import { useProject } from "@/lib/project/useProject";
import { AssetTile } from "./AssetTile";

export function NarratorAssetTile({ onEdit }: { onEdit: () => void }) {
	return (
		<AssetTile name="Narrator" Icon={Mic} fallback="icon" onEdit={onEdit} />
	);
}

export function ArtStyleAssetTile({ onEdit }: { onEdit: () => void }) {
	return (
		<AssetTile
			name="Art style"
			Icon={Palette}
			fallback="icon"
			onEdit={onEdit}
		/>
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
	return Object.keys(characters).map((name) => (
		<CharacterAssetTile
			key={`character:${name}`}
			name={name}
			onEdit={() => onEdit(name)}
			onRemove={onRemove && (() => onRemove(name))}
		/>
	));
}

function CharacterAssetTile({
	name,
	onEdit,
	onRemove,
}: {
	name: string;
	onEdit: () => void;
	onRemove?: () => void;
}) {
	const elementId = characterAvatarElementId(name);
	const previewUrl = useQueueSelector((queue) =>
		characterAvatarUrl(queue, name),
	);
	return (
		<AssetTile
			name={name}
			previewUrl={previewUrl}
			Icon={User}
			elementId={elementId}
			onEdit={onEdit}
			onRemove={onRemove}
			removeAffordance="corner"
		/>
	);
}

export function ReferenceAssetTiles() {
	const referenceImages = useProject((s) => s.referenceImages);
	const removeReferenceImage = useProject((s) => s.removeReferenceImage);
	return referenceImages.map((url, index) => (
		<AssetTile
			key={`reference:${url}`}
			name={`Reference ${index + 1}`}
			previewUrl={url}
			Icon={Image}
			onRemove={() => removeReferenceImage(index)}
		/>
	));
}
