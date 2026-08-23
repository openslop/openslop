"use client";

import { Image, Mic, Palette, User, UserPlus } from "@/components/ui/icon";
import { useQueueSelector } from "@/lib/generation/GenerationQueueProvider";
import {
	characterAvatarElementId,
	characterAvatarUrl,
} from "@/lib/project/characterAvatar";
import { useProject } from "@/lib/project/useProject";
import { AddAssetTile } from "./AddAssetTile";
import { AssetTile } from "./AssetTile";
import { useAssetEditors } from "./character/AssetEditProvider";

export function NarratorAssetTile() {
	const { openNarrator } = useAssetEditors();
	return (
		<AssetTile
			name="Narrator"
			Icon={Mic}
			fallback="icon"
			onEdit={openNarrator}
		/>
	);
}

export function ArtStyleAssetTile() {
	const { openArtStyle } = useAssetEditors();
	return (
		<AssetTile
			name="Art style"
			Icon={Palette}
			fallback="icon"
			onEdit={openArtStyle}
		/>
	);
}

export function AddCharacterTile() {
	const { openCreateCharacter } = useAssetEditors();
	return (
		<AddAssetTile
			label="Character"
			ariaLabel="Add character"
			Icon={UserPlus}
			onClick={openCreateCharacter}
		/>
	);
}

export function CharacterAssetTiles({
	onRemove,
}: {
	onRemove?: (name: string) => void;
}) {
	const characters = useProject((s) => s.metadata.characters);
	return Object.keys(characters).map((name) => (
		<CharacterAssetTile
			key={`character:${name}`}
			name={name}
			onRemove={onRemove && (() => onRemove(name))}
		/>
	));
}

function CharacterAssetTile({
	name,
	onRemove,
}: {
	name: string;
	onRemove?: () => void;
}) {
	const { editCharacter } = useAssetEditors();
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
			onEdit={() => editCharacter(name)}
			onRemove={onRemove}
			removeAffordance="corner"
		/>
	);
}

export function ReferenceTiles({
	urls,
	onRemove,
}: {
	urls: string[];
	onRemove: (index: number) => void;
}) {
	return urls.map((url, index) => (
		<AssetTile
			key={`reference:${index}:${url}`}
			name={`Reference ${index + 1}`}
			previewUrl={url}
			Icon={Image}
			onRemove={() => onRemove(index)}
		/>
	));
}

export function ReferenceAssetTiles() {
	const referenceImages = useProject((s) => s.referenceImages);
	const removeReferenceImage = useProject((s) => s.removeReferenceImage);
	return (
		<ReferenceTiles urls={referenceImages} onRemove={removeReferenceImage} />
	);
}
