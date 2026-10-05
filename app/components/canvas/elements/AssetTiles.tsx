"use client";

import { Image, Mic, Palette, User } from "@/components/ui/icon";
import { hasAvatar, NARRATOR } from "@/lib/canvas/assets";
import { useAsset, useCastNames } from "@/lib/canvas/useAssets";
import { useCharacterAvatar } from "../hooks/useCharacterAvatar";
import { useReferenceImages } from "../hooks/useReferenceImages";
import { AddAssetTile } from "./AddAssetTile";
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
			onEdit={() => editAsset("style")}
		/>
	);
}

export function AddArtStyleTile() {
	const { editAsset } = useAssetEditors();
	if (useAsset("style")) return null;
	return (
		<AddAssetTile
			label="Art style"
			ariaLabel="Add art style"
			Icon={Palette}
			onClick={() => editAsset("style")}
		/>
	);
}

export function AddNarratorTile() {
	const { editSpeaker } = useAssetEditors();
	if (useAsset("cast", NARRATOR)) return null;
	return (
		<AddAssetTile
			label={NARRATOR}
			ariaLabel="Add narrator"
			Icon={Mic}
			onClick={() => editSpeaker()}
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

export function CharacterAssetTile({
	name,
	onRemove,
	...tile
}: TileProps & {
	name: string;
	onRemove?: () => void;
}) {
	const { editAsset } = useAssetEditors();
	const cast = useAsset("cast", name);
	const avatar = !cast || hasAvatar(cast);
	const { url: previewUrl, status } = useCharacterAvatar(name);
	return (
		<AssetTile
			name={name}
			previewUrl={avatar ? previewUrl : undefined}
			Icon={avatar ? User : Mic}
			fallback={avatar ? "initial" : "icon"}
			status={status}
			onEdit={() => editAsset("cast", name)}
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
