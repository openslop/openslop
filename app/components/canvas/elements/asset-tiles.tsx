"use client";

import { Image, Mic, Palette, User } from "@/components/ui/icon";
import { useHasAsset } from "@/lib/canvas/use-assets";
import { useCharacterAvatar } from "../hooks/use-character-avatar";
import { AssetTile } from "./asset-tile";
import { useAssetEditors } from "./character/asset-edit-provider";

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
	const { editAsset } = useAssetEditors();
	const hasAvatar = useHasAsset("asset_avatar", name);
	const avatar = useCharacterAvatar(name);
	return hasAvatar ? (
		<AssetTile
			name={name}
			previewUrl={avatar.url}
			Icon={User}
			status={avatar.status}
			onEdit={() => editAsset("asset_avatar", name)}
			{...tile}
		/>
	) : (
		<AssetTile
			name={name}
			Icon={Mic}
			fallback="icon"
			onEdit={() => editAsset("asset_voice", name)}
			{...tile}
		/>
	);
}

type ReferenceTileProps = TileProps & {
	url: string;
	index: number;
	onRemove: () => void;
};

export function ReferenceTile({
	url,
	index,
	...tile
}: ReferenceTileProps & { onEdit?: () => void }) {
	return (
		<AssetTile
			name={`Reference ${index + 1}`}
			previewUrl={url}
			Icon={Image}
			{...tile}
		/>
	);
}

export function ReferenceAssetTile(tile: ReferenceTileProps) {
	const { editAsset } = useAssetEditors();
	return (
		<ReferenceTile {...tile} onEdit={() => editAsset("asset_references")} />
	);
}
