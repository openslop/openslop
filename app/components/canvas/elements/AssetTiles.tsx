"use client";

import { Image, Mic, Palette, User } from "@/components/ui/icon";
import { useAsset } from "@/lib/canvas/useAssets";
import { useCharacterAvatar } from "../hooks/useCharacterAvatar";
import { AssetTile } from "./AssetTile";
import { useAssetEditors } from "./character/AssetEditProvider";

type TileProps = { fill?: boolean };

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

type CharacterTileProps = TileProps & { name: string; onRemove?: () => void };

/** A character by their look, or by their voice when they have no look. */
export function CharacterAssetTile({ name, ...tile }: CharacterTileProps) {
	const hasAvatar = useAsset("asset_avatar", name) !== undefined;
	return hasAvatar ? (
		<AvatarAssetTile name={name} {...tile} />
	) : (
		<VoiceAssetTile name={name} {...tile} />
	);
}

function AvatarAssetTile({ name, ...tile }: CharacterTileProps) {
	const { editAsset } = useAssetEditors();
	const { url, status } = useCharacterAvatar(name);
	return (
		<AssetTile
			name={name}
			previewUrl={url}
			Icon={User}
			fallback="initial"
			status={status}
			onEdit={() => editAsset("asset_avatar", name)}
			removeAffordance="corner"
			{...tile}
		/>
	);
}

function VoiceAssetTile({ name, ...tile }: CharacterTileProps) {
	const { editAsset } = useAssetEditors();
	return (
		<AssetTile
			name={name}
			Icon={Mic}
			fallback="icon"
			onEdit={() => editAsset("asset_voice", name)}
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
}: {
	urls: string[];
	onRemove: (index: number) => void;
}) {
	return urls.map((url, index) => (
		<ReferenceTile
			key={`reference:${index}:${url}`}
			url={url}
			index={index}
			onRemove={() => onRemove(index)}
		/>
	));
}
