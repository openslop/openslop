"use client";

import { useState, type ReactNode } from "react";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import {
	Image,
	MagicEdit,
	Mic,
	Palette,
	Pencil,
	User,
} from "@/components/ui/icon";
import type { MediaItem } from "@/lib/project/media";
import { useProject } from "@/lib/project/use-project";
import { useHasAsset } from "@/lib/canvas/use-assets";
import { useCharacterAvatar } from "../hooks/use-character-avatar";
import { AssetTile } from "./asset-tile";
import { AudioCard } from "./audio-card";
import { AudioPlayer } from "./audio-player";
import { MEDIA_KINDS } from "./media-kinds";
import {
	DeleteItem,
	TileMenuItem,
	useTilePlayer,
	type TilePrimary,
} from "./tile-actions";
import { useAssetEditors } from "./asset-edit-context";
import { usePlayground } from "../playground/playground-context";
import { useTake } from "../playground/use-take";

type TileProps = { children?: ReactNode };

const editing = (name: string, onSelect: () => void): TilePrimary => ({
	label: `Edit ${name}`,
	icon: Pencil,
	onSelect,
});

export function ArtStyleAssetTile(tile: TileProps) {
	const { editAsset } = useAssetEditors();
	return (
		<AssetTile
			name="Art style"
			Icon={Palette}
			fallback="icon"
			primary={editing("Art style", () => editAsset("asset_style"))}
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
			context="Character"
			Icon={User}
			status={avatar.status}
			startedAt={avatar.startedAt}
			primary={editing(name, () => editAsset("asset_avatar", name))}
			{...tile}
		/>
	) : (
		<AssetTile
			name={name}
			Icon={Mic}
			fallback="icon"
			primary={editing(name, () => editAsset("asset_voice", name))}
			{...tile}
		/>
	);
}

type ReferenceTileProps = TileProps & {
	url: string;
	index: number;
	onRemove: () => void;
};

const referenceName = (index: number) => `Reference ${index + 1}`;

export function ReferenceTile({
	url,
	index,
	...tile
}: ReferenceTileProps & { primary?: TilePrimary }) {
	return (
		<AssetTile
			name={referenceName(index)}
			previewUrl={url}
			context="Reference image"
			Icon={Image}
			{...tile}
		/>
	);
}

export function ReferenceAssetTile(tile: ReferenceTileProps) {
	const { editAsset } = useAssetEditors();
	return (
		<ReferenceTile
			{...tile}
			primary={editing(referenceName(tile.index), () =>
				editAsset("asset_references"),
			)}
		/>
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
	/** Menu items before Delete. */
	menu?: ReactNode;
};

/** Loads the request that made `item` into the playground, when the playground made it. */
function useReusing(item: MediaItem) {
	const { take } = useTake(item);
	const { reuse } = usePlayground();
	return (
		take && {
			label: `Load the request that made ${item.name}`,
			icon: MagicEdit,
			onSelect: () => reuse(take),
		}
	);
}

const LoadRequestItem = ({ onSelect }: { onSelect: () => void }) => (
	<TileMenuItem icon={MagicEdit} onSelect={onSelect}>
		Load request
	</TileMenuItem>
);

/** A piece of the project's media as a small tile; its request is the face's action or in its menu. */
export function MediaAssetTile({
	item,
	primary,
	menu,
	children,
}: MediaTileProps & { primary?: TilePrimary }) {
	const { name, kind, url, createdAt } = item;
	const remove = useDeleteMedia(name);
	const reusing = useReusing(item);
	const player = useTilePlayer(kind === "video" ? url : undefined, name);
	const chosen = primary ?? player.primary ?? reusing;
	const previewKind = kind === "audio" ? undefined : kind;
	return (
		<>
			<AssetTile
				name={name}
				previewUrl={previewKind && url}
				previewKind={previewKind}
				context="Media library"
				createdAt={createdAt}
				Icon={MEDIA_KINDS[kind].Icon}
				fallback="icon"
				primary={chosen}
				menu={
					<>
						{reusing && chosen !== reusing && (
							<LoadRequestItem onSelect={reusing.onSelect} />
						)}
						{menu}
					</>
				}
				onDelete={remove.request}
			>
				{player.video}
				{children}
			</AssetTile>
			{remove.dialog}
		</>
	);
}

/** Audio has no face to choose, so its request is always in the menu. */
function MediaAudioRow({ item, menu }: MediaTileProps) {
	const remove = useDeleteMedia(item.name);
	const reusing = useReusing(item);
	return (
		<>
			<AudioCard
				name={item.name}
				menu={
					<>
						{reusing && <LoadRequestItem onSelect={reusing.onSelect} />}
						{menu}
						<DeleteItem onSelect={remove.request} />
					</>
				}
			>
				<AudioPlayer src={item.url} tone="panel" />
			</AudioCard>
			{remove.dialog}
		</>
	);
}

/** A piece of media as a library lists it: pictures and video as tiles, audio a row wide. */
export function MediaLibraryItem({ item, menu, children }: MediaTileProps) {
	return item.kind === "audio" ? (
		<MediaAudioRow item={item} menu={menu} />
	) : (
		<MediaAssetTile item={item} menu={menu}>
			{children}
		</MediaAssetTile>
	);
}
