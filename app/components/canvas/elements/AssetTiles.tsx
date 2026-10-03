"use client";

import { Image, Mic, Palette, User, UserPlus } from "@/components/ui/icon";
import { useCastNames } from "@/lib/canvas/useAssets";
import { useCharacterAvatar } from "../hooks/useCharacterAvatar";
import { useReferenceImages } from "../hooks/useReferenceImages";
import { AddAssetTile } from "./AddAssetTile";
import { AssetTile } from "./AssetTile";
import { useAssetEditors } from "./character/AssetEditProvider";

export function NarratorAssetTile() {
	const { editAsset } = useAssetEditors();
	return (
		<AssetTile
			name="Narrator"
			Icon={Mic}
			fallback="icon"
			onEdit={() => editAsset("voice")}
		/>
	);
}

export function ArtStyleAssetTile() {
	const { editAsset } = useAssetEditors();
	return (
		<AssetTile
			name="Art style"
			Icon={Palette}
			fallback="icon"
			onEdit={() => editAsset("style")}
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
	return useCastNames().map((name) => (
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
	const { editAsset } = useAssetEditors();
	const { url: previewUrl, status } = useCharacterAvatar(name);
	return (
		<AssetTile
			name={name}
			previewUrl={previewUrl}
			Icon={User}
			status={status}
			onEdit={() => editAsset("cast", name)}
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
	const { urls, remove } = useReferenceImages();
	return <ReferenceTiles urls={urls} onRemove={remove} />;
}
