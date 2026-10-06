"use client";

import { Image, Mic, Palette, User } from "@/components/ui/icon";
import { hasAvatar } from "@/lib/canvas/assets";
import type { AssetElement } from "@/lib/canvas/types";
import { useCharacters } from "@/lib/canvas/useAssets";
import { useCharacterAvatar } from "../hooks/useCharacterAvatar";
import { useReferenceImages } from "../hooks/useReferenceImages";
import { AssetTile } from "./AssetTile";
import { useAssetEditors } from "./character/AssetEditProvider";

type TileProps = { selected?: boolean; fill?: boolean };

export function ArtStyleAssetTile(tile: TileProps) {
	const { editAsset } = useAssetEditors();
	return (
		<AssetTile
			name="Art style"
			Icon={Palette}
			fallback="icon"
			onEdit={() => editAsset("asset_style")}
			{...tile}
		/>
	);
}

export function CharacterAssetTiles({
	onRemove,
}: {
	onRemove?: (name: string) => void;
}) {
	return useCharacters().map((character) => (
		<CharacterAssetTile
			key={character.id}
			character={character}
			onRemove={onRemove}
		/>
	));
}

export function CharacterAssetTile({
	character,
	onRemove,
	...tile
}: TileProps & {
	character: AssetElement;
	onRemove?: (name: string) => void;
}) {
	const { editCharacter } = useAssetEditors();
	const name = character.generationAttributes?.name ?? "";
	const avatar = hasAvatar(character);
	const { url: previewUrl, status } = useCharacterAvatar(name);
	return (
		<AssetTile
			name={name}
			previewUrl={avatar ? previewUrl : undefined}
			Icon={avatar ? User : Mic}
			fallback={avatar ? "initial" : "icon"}
			status={status}
			onEdit={() => editCharacter(name)}
			onRemove={onRemove && (() => onRemove(name))}
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
