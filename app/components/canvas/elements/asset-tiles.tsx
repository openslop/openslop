"use client";

import { useState, type ReactNode } from "react";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { Image, Mic, Palette, User } from "@/components/ui/icon";
import type { MediaItem } from "@/lib/project/media";
import { useProject } from "@/lib/project/use-project";
import { useHasAsset } from "@/lib/canvas/use-assets";
import { useCharacterAvatar } from "../hooks/use-character-avatar";
import { AssetTile } from "./asset-tile";
import { AudioCard } from "./audio-card";
import { AudioPlayer } from "./audio-player";
import { MEDIA_KINDS } from "./media-kinds";
import { DeleteAction, ReuseAction } from "./tile-actions";
import { useAssetEditors } from "./asset-edit-context";

type TileProps = { children?: ReactNode };

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

type CharacterTileProps = TileProps & { name: string; onDelete?: () => void };

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

/** Asks before taking a piece of media out of the project. */
function useDeleteMedia(name: string) {
	const removeMedia = useProject((state) => state.removeMedia);
	const [confirming, setConfirming] = useState(false);
	return {
		request: () => setConfirming(true),
		dialog: (
			<ConfirmDeleteDialog
				target={confirming ? name : undefined}
				onClose={() => setConfirming(false)}
				title={(target) => `Delete ${target}?`}
				description="This deletes it from the project's media. It can't be undone. Elements already using it keep it."
				actionLabel="Delete"
				onConfirm={removeMedia}
			/>
		),
	};
}

type MediaTileProps = TileProps & {
	item: MediaItem;
	actions?: ReactNode;
};

/** A piece of the project's media as a small tile; audio shows by its icon. */
export function MediaAssetTile({
	item: { name, kind, url },
	...tile
}: MediaTileProps) {
	const remove = useDeleteMedia(name);
	const previewKind = kind === "audio" ? undefined : kind;
	return (
		<>
			<AssetTile
				name={name}
				previewUrl={previewKind && url}
				previewKind={previewKind}
				Icon={MEDIA_KINDS[kind].Icon}
				fallback="icon"
				onDelete={remove.request}
				{...tile}
			/>
			{remove.dialog}
		</>
	);
}

/** A piece of media as a library lists it: pictures as tiles, video and audio a row wide. */
function MediaAudioRow({ item, actions }: MediaTileProps) {
	const remove = useDeleteMedia(item.name);
	return (
		<>
			<AudioCard
				name={item.name}
				actions={
					<>
						{actions}
						<DeleteAction name={item.name} onClick={remove.request} />
					</>
				}
			>
				<AudioPlayer src={item.url} tone="panel" />
			</AudioCard>
			{remove.dialog}
		</>
	);
}

export function MediaLibraryItem({
	item,
	actions,
	onReuse,
	children,
}: MediaTileProps & { onReuse?: () => void }) {
	const pill = (
		<>
			{onReuse && <ReuseAction name={item.name} onClick={onReuse} />}
			{actions}
		</>
	);
	return item.kind === "audio" ? (
		<MediaAudioRow item={item} actions={pill} />
	) : (
		<MediaAssetTile item={item} actions={pill}>
			{children}
		</MediaAssetTile>
	);
}
