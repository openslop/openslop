"use client";

import { useState } from "react";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import {
	Image,
	Mic,
	Music,
	Palette,
	User,
	Video,
	type IconComponent,
} from "@/components/ui/icon";
import type { MediaItem } from "@/lib/project/media";
import { useProject } from "@/lib/project/use-project";
import type { UploadKind } from "@/lib/upload/upload-files";
import { useHasAsset } from "@/lib/canvas/use-assets";
import { useCharacterAvatar } from "../hooks/use-character-avatar";
import { AssetTile } from "./asset-tile";
import { useAssetEditors } from "./asset-edit-context";

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
			startedAt={avatar.startedAt}
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

const MEDIA_ICONS: Record<UploadKind, IconComponent> = {
	image: Image,
	video: Video,
	audio: Music,
};

export function MediaAssetTile({
	item: { name, kind, url },
	...tile
}: TileProps & { item: MediaItem }) {
	const removeMedia = useProject((state) => state.removeMedia);
	const [confirming, setConfirming] = useState(false);
	const preview = kind === "audio" ? undefined : kind;
	return (
		<>
			<AssetTile
				name={name}
				previewUrl={preview && url}
				previewKind={preview}
				Icon={MEDIA_ICONS[kind]}
				fallback="icon"
				onRemove={() => setConfirming(true)}
				{...tile}
			/>
			<ConfirmDeleteDialog
				target={confirming ? name : undefined}
				onClose={() => setConfirming(false)}
				title={(target) => `Remove ${target}?`}
				description="This removes it from the project's media. It can't be undone. Elements already using it keep it."
				actionLabel="Remove"
				onConfirm={removeMedia}
			/>
		</>
	);
}
