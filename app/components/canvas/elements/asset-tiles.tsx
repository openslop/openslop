"use client";

import type { ReactNode } from "react";
import { useSlateStatic } from "slate-react";
import { Image, Mic, Palette, Pencil, User, X } from "@/components/ui/icon";
import type { MediaItem } from "@/lib/project/media";
import { useHasAsset } from "@/lib/canvas/use-assets";
import { useCharacterAvatar } from "../hooks/use-character-avatar";
import { AssetTile } from "./asset-tile";
import { AudioCard } from "./audio-card";
import { AudioPlayer } from "./audio-player";
import { MEDIA_KINDS } from "./media-kinds";
import { TileMenuItem, useTilePlayer, type TilePrimary } from "./tile-actions";
import { useAssetEditors } from "./asset-edit-context";
import { deleteArtStyle } from "./delete-asset";
import { LoadRequestItem, useLoadRequest } from "../media/load-request";

type TileProps = { children?: ReactNode };

const editing = (name: string, onSelect: () => void): TilePrimary => ({
	label: `Edit ${name}`,
	icon: Pencil,
	onSelect,
});

export function ArtStyleAssetTile(tile: TileProps) {
	const editor = useSlateStatic();
	const { editAsset } = useAssetEditors();
	return (
		<AssetTile
			name="Art style"
			Icon={Palette}
			fallback="icon"
			primary={editing("Art style", () => editAsset("asset_style"))}
			onDelete={() => deleteArtStyle(editor)}
			{...tile}
		/>
	);
}

type CharacterTileProps = TileProps & { name: string; onDelete: () => void };

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

type ReferenceTileProps = { url: string; index: number; onRemove: () => void };

const referenceName = (index: number) => `Reference ${index + 1}`;

/** A reference image: its menu takes it off the references. */
export function ReferenceTile({
	url,
	index,
	primary,
	onRemove,
}: ReferenceTileProps & { primary?: TilePrimary }) {
	return (
		<AssetTile
			name={referenceName(index)}
			previewUrl={url}
			context="Reference image"
			Icon={Image}
			primary={primary}
			menu={
				<TileMenuItem icon={X} onSelect={onRemove}>
					Remove from references
				</TileMenuItem>
			}
		/>
	);
}

/** A project reference image on the canvas strip or the assets panel, where choosing it edits the references. */
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

type MediaTileProps = TileProps & { item: MediaItem; menu?: ReactNode };

/** A piece of the project's media as a small tile; the caller says what its face does, if anything. */
export function MediaAssetTile({
	item: { name, kind, url, createdAt, costUsd },
	primary,
	menu,
	children,
}: MediaTileProps & { primary: TilePrimary | undefined }) {
	const previewKind = kind === "audio" ? undefined : kind;
	return (
		<AssetTile
			name={name}
			previewUrl={previewKind && url}
			previewKind={previewKind}
			context="Media"
			createdAt={createdAt}
			costUsd={costUsd}
			Icon={MEDIA_KINDS[kind].Icon}
			fallback="icon"
			primary={primary}
			menu={menu}
		>
			{children}
		</AssetTile>
	);
}

/** Media as a library shows it: a video's face plays it, anything else's loads its request, which is otherwise in the menu. */
export function LibraryMediaTile({ item, menu, children }: MediaTileProps) {
	const player = useTilePlayer(
		item.kind === "video" ? item.url : undefined,
		item.name,
	);
	const request = useLoadRequest(item);
	return (
		<MediaAssetTile
			item={item}
			primary={player.primary ?? request}
			menu={
				<>
					{player.primary && request && <LoadRequestItem {...request} />}
					{menu}
				</>
			}
		>
			{player.video}
			{children}
		</MediaAssetTile>
	);
}

/** Audio has no face to choose, so its request is always in the menu. */
function MediaAudioRow({ item, menu }: MediaTileProps) {
	const request = useLoadRequest(item);
	return (
		<AudioCard
			name={item.name}
			menu={
				<>
					{request && <LoadRequestItem {...request} />}
					{menu}
				</>
			}
		>
			<AudioPlayer src={item.url} tone="panel" />
		</AudioCard>
	);
}

/** A piece of media as a library lists it: pictures and video as tiles, audio a row wide. */
export function MediaLibraryItem({ item, menu, children }: MediaTileProps) {
	return item.kind === "audio" ? (
		<MediaAudioRow item={item} menu={menu} />
	) : (
		<LibraryMediaTile item={item} menu={menu}>
			{children}
		</LibraryMediaTile>
	);
}
