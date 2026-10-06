"use client";

import { Image, Mic, Palette, User } from "@/components/ui/icon";
import { hasAvatar, NARRATOR } from "@/lib/canvas/assets";
import { useAsset, useCharacterNames } from "@/lib/canvas/useAssets";
import { useCharacterAvatar } from "../hooks/useCharacterAvatar";
import { useReferenceImages } from "../hooks/useReferenceImages";
import { AssetTile } from "./AssetTile";
import { useAssetEditors } from "./character/AssetEditProvider";

type TileProps = { selected?: boolean; fill?: boolean };

export function ArtStyleAssetTile({ selected }: TileProps) {
	const { editAsset } = useAssetEditors();
	return (
		<AssetTile
			name="Art style"
			Icon={Palette}
			fallback="icon"
			selected={selected}
			onEdit={() => editAsset("asset_style")}
		/>
	);
}

/** The narrator before it has an asset: editing it gives the narrator one. */
export function NarratorTile() {
	const { editSpeaker } = useAssetEditors();
	return (
		<AssetTile
			name={NARRATOR}
			Icon={Mic}
			fallback="icon"
			onEdit={() => editSpeaker()}
		/>
	);
}

export function CharacterAssetTiles({
	onRemove,
}: {
	onRemove?: (name: string) => void;
}) {
	return useCharacterNames().map((name) => (
		<CharacterAssetTile
			key={`character:${name}`}
			name={name}
			onRemove={onRemove && (() => onRemove(name))}
		/>
	));
}

export function CharacterAssetTile({
	name,
	onRemove,
	...tile
}: TileProps & {
	name: string;
	onRemove?: () => void;
}) {
	const { editAsset } = useAssetEditors();
	const character = useAsset("asset_character", name);
	const avatar = !character || hasAvatar(character);
	const { url: previewUrl, status } = useCharacterAvatar(name);
	return (
		<AssetTile
			name={name}
			previewUrl={avatar ? previewUrl : undefined}
			Icon={avatar ? User : Mic}
			fallback={avatar ? "initial" : "icon"}
			status={status}
			onEdit={() => editAsset("asset_character", name)}
			onRemove={onRemove}
			removeAffordance="corner"
			{...tile}
		/>
	);
}

export function ReferenceTile({
	url,
	index,
	onRemove,
	...tile
}: TileProps & {
	url: string;
	index: number;
	onRemove: () => void;
}) {
	return (
		<AssetTile
			name={`Reference ${index + 1}`}
			previewUrl={url}
			Icon={Image}
			onRemove={onRemove}
			{...tile}
		/>
	);
}

export function ReferenceTiles({
	urls,
	onRemove,
	selected,
}: TileProps & {
	urls: string[];
	onRemove: (index: number) => void;
}) {
	return urls.map((url, index) => (
		<ReferenceTile
			key={`reference:${index}:${url}`}
			url={url}
			index={index}
			selected={selected}
			onRemove={() => onRemove(index)}
		/>
	));
}

export function ReferenceAssetTiles({ selected }: TileProps) {
	const { urls, remove } = useReferenceImages();
	return <ReferenceTiles urls={urls} onRemove={remove} selected={selected} />;
}
